# GSI Orders - Unified E-commerce Platform

A unified e-commerce platform consolidating three brands: **Liquid Heaven**, **Motaquila**, and **Last Genie**.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account
- Anthropic API key (for chatbot)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gsiorders.com
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the template file
   cp env.template .env.local
   
   # Edit .env.local with your actual values
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Anthropic Claude AI Chatbot
ANTHROPIC_API_KEY=sk-ant-api03-your_anthropic_api_key
ANTHROPIC_MODEL=claude-3-haiku-20240307

# SendGrid Email (Optional)
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@gsiorders.com
```

## 🤖 Testing the Chatbot

The AI chatbot is integrated throughout the site and can be tested in several ways:

### 1. Frontend Testing
- Visit any page on the site
- Click the chat icon in the bottom-right corner
- Ask questions about products, brands, or general inquiries
- The chatbot will respond with brand-aware information

### 2. API Testing
Use the provided Postman collection:
```bash
# Import the collection
testing/manual-chatbot-haiku-test.json
```

Or test directly with curl:
```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "liquidheaven",
    "question": "What products do you have?"
  }'
```

### 3. Model Configuration
The chatbot uses environment-driven model selection:
- **Default**: `claude-3-haiku-20240307` (always available)
- **Upgrade**: Set `ANTHROPIC_MODEL=claude-3-sonnet-20240229` for enhanced responses

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- chatbot.spec.ts
```

## 📁 Project Structure

```
gsiorders.com/
├── pages/              # Next.js pages and API routes
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   └── styles/         # Global styles
├── __tests__/          # Test files
├── testing/            # Manual testing collections
├── supabase/           # Database migrations
└── DOCS/              # Project documentation
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run test suite
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint

## 🎯 Features

- **Multi-brand Architecture**: Support for Liquid Heaven, Motaquila, and Last Genie
- **AI Chatbot**: Claude-powered customer support
- **Stripe Integration**: Secure payment processing
- **Inventory Management**: Real-time stock tracking
- **Admin Dashboard**: Comprehensive management tools
- **Responsive Design**: Mobile-first approach
- **TypeScript**: Full type safety

## 📚 Documentation

- [Functional Requirements](DOCS/Final_FRD_gsiorders_com_v2.md)
- [Technical Requirements](DOCS/Final_SRD_gsiorders_com_v2_1.md)
- [Implementation Plan](DOCS/Implementation_Plan_v2_2_gsiorders_com.md)
- [Testing Guide](DOCS/Test_Plan_Expanded_v2_FINAL_10of10.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is proprietary software for GSI Orders.

---

**Need help?** Check the chat icon on any page for AI-powered support! 