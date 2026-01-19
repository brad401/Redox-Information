# REDOX Information - Landing Page Gateway

A production-ready landing page system that serves as a secure gateway to ASEA GPT ONE, featuring user information collection, access code validation, and comprehensive admin dashboard for tracking and management.

## Features

### Landing Page
- **Professional Design**: Conversion-optimized, responsive landing page
- **User Form Collection**: Captures First Name, Last Name, and Access Code
- **Access Code Validation**: Server-side validation before granting access
- **Smart Redirect**: Automatic redirect to ASEA GPT ONE upon successful validation
- **Error Handling**: Clear error messages for invalid access codes
- **Loading States**: Visual feedback during form submission
- **Mobile Responsive**: Optimized for all device sizes

### Admin Dashboard
- **Secure Authentication**: Password-protected admin access
- **User Submissions Table**: View all form submissions with timestamps
- **Real-time Statistics**:
  - Total submissions count
  - Last 7 days submissions
  - Current month submissions
- **Access Code Management**: Easily update the access code
- **Auto-refresh**: Dashboard updates every 30 seconds
- **Export Ready**: Clean table format for easy data export

### Technical Features
- **SQLite Database**: Lightweight, file-based database (no external dependencies)
- **Session Management**: Secure admin sessions
- **RESTful API**: Clean API endpoints for all operations
- **Input Validation**: Client and server-side validation
- **Security**: Protected endpoints, sanitized inputs
- **Production Ready**: Environment-based configuration

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Redox-Information
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your settings:
   ```env
   PORT=3000
   SESSION_SECRET=your-random-secret-key-here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   INITIAL_ACCESS_CODE=REDOX2024
   REDIRECT_URL=https://chatgpt.com/g/g-694191f512388191bda7a758e1d5d696-asea-gpt-one
   ```

4. **Start the server**

   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

5. **Access the application**
   - Landing Page: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin

## Project Structure

```
Redox-Information/
├── server.js                 # Express server and API endpoints
├── database.js              # Database operations and queries
├── package.json             # Dependencies and scripts
├── .env                     # Environment configuration (not in git)
├── .env.example            # Example environment file
├── public/                 # Static files
│   ├── index.html         # Landing page
│   ├── admin.html         # Admin dashboard
│   ├── css/
│   │   ├── style.css      # Landing page styles
│   │   └── admin.css      # Admin dashboard styles
│   └── js/
│       ├── main.js        # Landing page JavaScript
│       └── admin.js       # Admin dashboard JavaScript
└── redox.db               # SQLite database (auto-generated)
```

## API Endpoints

### Public Endpoints

**POST /api/verify-access**
- Verify access code and store submission
- Body: `{ firstName, lastName, accessCode }`
- Returns: `{ success, message, redirectUrl }`

### Admin Endpoints (Authentication Required)

**POST /api/admin/login**
- Admin login
- Body: `{ username, password }`
- Returns: `{ success, message }`

**POST /api/admin/logout**
- Logout current admin session
- Returns: `{ success, message }`

**GET /api/admin/check**
- Check if current session is authenticated
- Returns: `{ isAuthenticated }`

**GET /api/admin/submissions**
- Get all user submissions
- Returns: `{ success, submissions[] }`

**GET /api/admin/stats**
- Get submission statistics
- Returns: `{ success, stats: { total, byDay[], byMonth[] } }`

**GET /api/admin/access-code**
- Get current access code
- Returns: `{ success, accessCode }`

**POST /api/admin/access-code**
- Update access code
- Body: `{ accessCode }`
- Returns: `{ success, message }`

## Database Schema

### submissions
| Column      | Type     | Description                    |
|-------------|----------|--------------------------------|
| id          | INTEGER  | Primary key (auto-increment)   |
| first_name  | TEXT     | User's first name              |
| last_name   | TEXT     | User's last name               |
| timestamp   | DATETIME | Submission timestamp (UTC)     |

### settings
| Column | Type | Description                          |
|--------|------|--------------------------------------|
| key    | TEXT | Setting key (primary key)            |
| value  | TEXT | Setting value                        |

## Usage

### For End Users

1. Visit the landing page
2. Enter your First Name, Last Name, and Access Code
3. Submit the form
4. If the access code is valid, you'll be redirected to ASEA GPT ONE
5. If invalid, you'll see an error message to try again

### For Administrators

1. Navigate to `/admin`
2. Login with your admin credentials (from `.env`)
3. View the dashboard with:
   - Real-time statistics
   - All user submissions
   - Access code management
4. Update the access code as needed
5. Use the refresh button to manually update data

## Security Considerations

### Production Deployment

1. **Change Default Credentials**
   - Update `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`
   - Use strong, unique passwords

2. **Session Secret**
   - Generate a random, secure `SESSION_SECRET`
   - Keep it private and never commit to version control

3. **HTTPS**
   - Deploy behind HTTPS in production
   - Update session cookie to `secure: true` in server.js

4. **Environment Variables**
   - Never commit `.env` file
   - Use environment variables in production hosting

5. **Database Backup**
   - Regularly backup `redox.db`
   - Consider using a more robust database for high traffic

6. **Rate Limiting**
   - Consider adding rate limiting for production
   - Prevents brute force attacks on access codes

## Customization

### Changing the Design

- **Colors**: Edit CSS variables in `/public/css/style.css` and `/public/css/admin.css`
- **Logo**: Update the header in `/public/index.html`
- **Content**: Modify text and features in `/public/index.html`

### Changing the Redirect URL

Update `REDIRECT_URL` in `.env` to point to your desired destination.

### Adding Features

- Edit `server.js` for new API endpoints
- Edit `database.js` for new database operations
- Update frontend files for new UI features

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify all dependencies are installed (`npm install`)
- Check `.env` file exists and is properly formatted

### Can't login to admin
- Verify credentials in `.env` match what you're entering
- Check console for error messages
- Restart the server after changing `.env`

### Database errors
- Delete `redox.db` to recreate fresh database
- Check file permissions in the project directory

### Form submission fails
- Check server is running
- Open browser console for error messages
- Verify network connectivity

## Development

### Adding New Features

1. Update database schema in `database.js`
2. Add API endpoints in `server.js`
3. Update frontend HTML/CSS/JS as needed
4. Test thoroughly before deploying

### Running Tests

```bash
# Add your test commands here
npm test
```

## License

ISC

## Support

For issues and questions, please contact your system administrator or open an issue in the repository.

---

**Built with ❤️ for ASEA REDOX Information**
