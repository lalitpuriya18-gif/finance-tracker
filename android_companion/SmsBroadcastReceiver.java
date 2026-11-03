package io.fintrack.companion;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * ==============================================================================
 * FinTrack — Android BroadcastReceiver for Real-Time Financial SMS Tracking
 * ==============================================================================
 * When a new SMS arrives, the Android OS broadcasts android.provider.Telephony.SMS_RECEIVED.
 * This component temporarily wakes up, intercepts the raw SMS payload, extracts the
 * message body, filters out non-financial messages and OTPs, and forwards financial
 * alerts to the FinTrack Python Flask background receiver over local Wi-Fi.
 * ==============================================================================
 */
public class SmsBroadcastReceiver extends BroadcastReceiver {

    private static final String TAG = "FinTrackSMS";
    
    // Default FinTrack Local Wi-Fi Webhook Endpoint
    // (Configure with your PC IP address displayed in FinTrack Settings)
    private static final String FINTRACK_WEBHOOK_URL = "http://192.168.1.100:5000/api/webhook/sms";

    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) {
            return;
        }

        // 1. Verify that the broadcast action is android.provider.Telephony.SMS_RECEIVED
        if ("android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) {
            Bundle bundle = intent.getExtras();
            if (bundle == null) return;

            try {
                // 2. Extract raw Protocol Data Units (PDUs) from Intent bundle
                Object[] pdus = (Object[]) bundle.get("pdus");
                if (pdus == null || pdus.length == 0) return;

                String format = bundle.getString("format");
                StringBuilder fullMessageBody = new StringBuilder();
                String senderAddress = "";

                // 3. Reconstruct full SMS body from multi-part PDU segments
                for (Object pdu : pdus) {
                    SmsMessage smsMessage;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        smsMessage = SmsMessage.createFromPdu((byte[]) pdu, format);
                    } else {
                        smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
                    }

                    if (smsMessage != null) {
                        senderAddress = smsMessage.getDisplayOriginatingAddress();
                        fullMessageBody.append(smsMessage.getMessageBody());
                    }
                }

                String messageText = fullMessageBody.toString();
                Log.d(TAG, "SMS Received from [" + senderAddress + "]: " + messageText);

                // 4. Client-side Pre-Filter:
                // Discard OTPs and non-financial spam immediately for user privacy
                if (isOtpOrNonFinancial(messageText)) {
                    Log.i(TAG, "Skipping non-transaction alert or sensitive OTP.");
                    return;
                }

                // 5. Verify presence of financial transaction signals (Amount / Currency / Direction)
                if (isFinancialAlert(messageText)) {
                    Log.i(TAG, "Financial transaction detected! Forwarding to FinTrack PC server...");
                    forwardToFinTrackWebhook(senderAddress, messageText);
                }

            } catch (Exception e) {
                Log.e(TAG, "Error intercepting SMS broadcast: " + e.getMessage(), e);
            }
        }
    }

    /**
     * Checks if the message is a sensitive OTP or login verification code.
     */
    private boolean isOtpOrNonFinancial(String text) {
        String lower = text.toLowerCase();
        return lower.contains("otp") ||
               lower.contains("verification code") ||
               lower.contains("secret code") ||
               lower.contains("security code") ||
               lower.contains("do not share");
    }

    /**
     * Checks if the message body contains debit or credit transaction indicators.
     */
    private boolean isFinancialAlert(String text) {
        String lower = text.toLowerCase();
        boolean hasAmount = lower.contains("rs") || lower.contains("inr") || lower.contains("₹");
        boolean hasDirection = lower.contains("debited") || lower.contains("credited") ||
                               lower.contains("sent") || lower.contains("spent") ||
                               lower.contains("paid") || lower.contains("withdrawn") ||
                               lower.contains("salary");
        return hasAmount && hasDirection;
    }

    /**
     * Sends the financial message over local Wi-Fi to the FinTrack Python Flask backend.
     */
    private void forwardToFinTrackWebhook(String sender, String messageText) {
        executor.execute(() -> {
            HttpURLConnection conn = null;
            try {
                URL url = new URL(FINTRACK_WEBHOOK_URL);
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                conn.setRequestProperty("User-Agent", "FinTrack-Android-BroadcastReceiver/1.0");
                conn.setConnectTimeout(4000);
                conn.setReadTimeout(4000);
                conn.setDoOutput(true);

                // Construct JSON payload
                JSONObject payload = new JSONObject();
                payload.put("sender", sender);
                payload.put("text", messageText);
                payload.put("timestamp", System.currentTimeMillis());

                byte[] postData = payload.toString().getBytes(StandardCharsets.UTF_8);
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(postData);
                    os.flush();
                }

                int responseCode = conn.getResponseCode();
                Log.i(TAG, "FinTrack Webhook Response HTTP: " + responseCode);

            } catch (Exception e) {
                Log.e(TAG, "Failed to connect to FinTrack Wi-Fi server: " + e.getMessage());
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
        });
    }
}
