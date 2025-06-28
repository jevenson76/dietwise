#!/bin/bash

echo "🔗 Stripe Webhook Configuration"
echo "=============================="
echo ""

# Check if stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "Installing Stripe CLI..."
    curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
    echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
    sudo apt update
    sudo apt install stripe
fi

echo "Please enter your backend URL (e.g., dietwise-backend.up.railway.app):"
read BACKEND_URL

echo ""
echo "Creating webhook endpoint..."

# Create webhook using Stripe CLI
stripe webhooks create \
  --url "https://$BACKEND_URL/api/v1/stripe/webhook" \
  --events customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed,checkout.session.completed \
  --api-key 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

echo ""
echo "Webhook created! The webhook secret will be displayed above."
echo "Copy it and run:"
echo "cd backend && railway variables set STRIPE_WEBHOOK_SECRET=whsec_..."