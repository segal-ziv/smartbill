import { Router } from 'express';
import { verifyWhatsAppChallenge } from '../../services/ingestion/whatsapp';
import { addIngestionJob } from '../../queues/ingestionQueue';
import { asyncHandler } from '../../middleware/errorHandler';
import { clerkAuth, requireAuth, getAuthUser } from '../../middleware/auth';

const router = Router();

/**
 * GET /api/webhooks/whatsapp
 * Verify WhatsApp webhook (initial setup)
 * This endpoint is NOT authenticated - WhatsApp needs public access for verification
 */
router.get(
  '/whatsapp',
  asyncHandler(async (req, res) => {
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    if (!mode || !token || !challenge) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const verified = verifyWhatsAppChallenge(mode, token, challenge);

    if (verified) {
      return res.status(200).type('text/plain').send(verified);
    }

    return res.status(403).json({ error: 'Verification failed' });
  })
);

/**
 * POST /api/webhooks/whatsapp
 * Handle incoming WhatsApp messages
 * This endpoint requires authentication to identify the user
 */
router.post(
  '/whatsapp',
  clerkAuth,
  requireAuth,
  asyncHandler(async (req, res) => {
    try {
      const body = req.body;
      const { userId } = getAuthUser(req);

      // WhatsApp sends webhooks in this format
      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field === 'messages') {
              const messages = change.value?.messages || [];

              for (const message of messages) {
                // Process each message
                if (message.type === 'image' || message.type === 'document') {
                  // Extract phone number
                  const phoneNumber = change.value?.metadata?.phone_number_id;

                  // Queue for processing
                  await addIngestionJob({
                    userId,
                    source: 'WHATSAPP',
                    metadata: {
                      message,
                      phoneNumber,
                    },
                  });

                  console.log(
                    `Queued WhatsApp message ${message.id} for processing`
                  );
                }
              }
            }
          }
        }
      }

      // WhatsApp expects 200 response
      return res.status(200).json({ status: 'received' });
    } catch (error) {
      console.error('WhatsApp webhook error:', error);

      // Still return 200 to WhatsApp to avoid retries
      return res.status(200).json({ status: 'error' });
    }
  })
);

export { router as webhooksRouter };
