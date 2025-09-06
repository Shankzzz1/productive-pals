# Vercel Deployment Guide for Productive Pals

## Prerequisites

1. **MongoDB Atlas Account**: Set up a MongoDB Atlas cluster
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Repository**: Push your code to GitHub

## Environment Variables Setup

### Required Environment Variables

Set these in your Vercel project dashboard under Settings > Environment Variables:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ProductivePals?retryWrites=true&w=majority
CLIENT_URL=https://your-app-name.vercel.app
JWT_SECRET=your-super-secure-jwt-secret-key-here
NODE_ENV=production
```

### How to Get Values:

1. **MONGO_URI**: 
   - Go to MongoDB Atlas
   - Create a cluster
   - Get connection string from "Connect" > "Connect your application"
   - Replace `<password>` with your database user password

2. **CLIENT_URL**: 
   - This will be your Vercel frontend URL (e.g., `https://productive-pals.vercel.app`)
   - Set this after your first deployment

3. **JWT_SECRET**: 
   - Generate a secure random string (at least 32 characters)
   - You can use: `openssl rand -base64 32`

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration

### 2. Configure Build Settings

Vercel should automatically detect:
- **Framework Preset**: Other
- **Root Directory**: Leave as root (`.`)
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `prod-client/dist`

### 3. Set Environment Variables

1. Go to Project Settings > Environment Variables
2. Add all the environment variables listed above
3. Make sure to set them for all environments (Production, Preview, Development)

### 4. Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at the provided Vercel URL

## Project Structure

```
productive-pals/
├── prod-client/          # React frontend
├── prod-server/          # Express backend
├── vercel.json          # Vercel configuration
├── package.json         # Root package.json
└── env.example          # Environment variables template
```

## Features Included

- ✅ Frontend deployment (React + Vite)
- ✅ Backend API deployment (Express + Socket.IO)
- ✅ Database connection (MongoDB Atlas)
- ✅ Environment variables configuration
- ✅ CORS configuration for production
- ✅ Socket.IO real-time features
- ✅ Static file serving

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check that all dependencies are installed
   - Verify TypeScript compilation
   - Check build logs in Vercel dashboard

2. **Database Connection Issues**:
   - Verify MONGO_URI is correct
   - Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for Vercel)
   - Ensure database user has proper permissions

3. **CORS Issues**:
   - Verify CLIENT_URL matches your Vercel domain
   - Check that credentials are properly configured

4. **Socket.IO Issues**:
   - Ensure both frontend and backend URLs are correct
   - Check that Socket.IO is properly configured for production

### Useful Commands:

```bash
# Install dependencies
npm install

# Build locally
npm run build

# Test locally
npm run dev
```

## Post-Deployment

1. **Update CLIENT_URL**: After first deployment, update the CLIENT_URL environment variable with your actual Vercel URL
2. **Test Features**: Verify all features work correctly
3. **Monitor Logs**: Check Vercel function logs for any issues
4. **Database**: Ensure your MongoDB Atlas cluster is properly configured

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique JWT secrets
- Regularly rotate secrets
- Monitor your application logs
- Use MongoDB Atlas security features (IP whitelisting, etc.)
