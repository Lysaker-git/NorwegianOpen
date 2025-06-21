# Norwegian Open West Coast Swing 2025 🕺💃

A full-featured event registration and management system for the Norwegian Open West Coast Swing competition in 2025, built with SvelteKit and powered by Supabase.

## Features

### Public Features
- **Dynamic Registration System**
  - Tiered pricing system (Ymir/Early Bird, Midgard/Regular, Ragnarok/Late Bird)
  - Nordic and World region pricing
  - Multiple pass options based on skill level
  - Automatic pricing calculations
  - Partner registration system
  - Blues Intensive workshop registration

- **Event Information**
  - Schedule viewing
  - Hotel booking with special rates
  - Pricing information
  - Location details
  - Teacher profiles
  - Rules and regulations

### Administrative Features
- **Dashboard**
  - Registration statistics
  - Payment tracking
  - Approval management
  - Regional distribution analytics
  - Level breakdowns

- **Registration Management**
  - Approval workflow
  - Payment verification
  - Email notifications
  - QR code generation for check-in

### Hotel Management
- Integrated hotel booking system
- Special rate handling
- Room sharing coordination
- Booking confirmation emails

## Technical Stack

- **Frontend**: SvelteKit
- **Backend**: SvelteKit + Supabase
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: SMTP integration
- **Styling**: TailwindCSS
- **Payment**: Bank transfer tracking

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/NorwegianOpen.git
cd NorwegianOpen
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with:
```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_EMAIL=your_email_for_notifications
GOOGLE_APP_PASSWORD=your_app_password
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── lib/            # Shared components and utilities
├── routes/         # SvelteKit routes
│   ├── admin/      # Admin dashboard and management
│   ├── register/   # Registration flow
│   └── api/        # API endpoints
└── components/     # Reusable UI components
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Deployment

1. Build the production version:
```bash
npm run build
```

2. Preview the build:
```bash
npm run preview
```

3. Deploy using your preferred hosting platform (e.g., Vercel, Netlify)

## License

This project is proprietary and confidential. Unauthorized copying, modification, distribution, or use is strictly prohibited.

## Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- Powered by [Supabase](https://supabase.io/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
