# Security Policy 🔒

## Reporting Vulnerabilities

If you discover a security vulnerability in this project, please report it responsibly.

## Sensitive Files

The following files contain sensitive information and **must NEVER be committed to Git**:

| File | Contains |
|------|----------|
| `backend/.env` | API keys, secret keys |

## Environment Variables

This project uses environment variables stored in `backend/.env`.  
A template file `backend/.env.example` is provided with placeholder values.

### Setup:
```bash
cd backend
cp .env.example .env
# Edit .env with your actual values
```

### Required Variables:
| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `GROQ_API_KEY` | Groq AI API key | [console.groq.com](https://console.groq.com) |
| `SECRET_KEY` | Flask secret key | Generate any random 32-char string |

## Best Practices

1. **Never hardcode API keys** in source code
2. **Never commit `.env` files** to version control
3. **Use `.env.example`** to document required variables
4. **Rotate keys** if accidentally exposed
5. If you accidentally push secrets, **revoke and regenerate** them immediately
