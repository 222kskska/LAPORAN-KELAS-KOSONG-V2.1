# Multi-User Architecture Guide

Understanding the multi-user system architecture.

## Architecture Overview

```
┌─────────────┐     HTTP/REST API      ┌──────────────┐      MySQL       ┌──────────┐
│   Client    │ ──────────────────────> │    Server    │ ────────────────> │ Database │
│  (Browser)  │ <────────────────────── │ (Node.js +   │ <──────────────── │ (MySQL)  │
│             │      JSON Response      │   Express)   │      Result       │          │
└─────────────┘                         └──────────────┘                   └──────────┘
```

## Components

### 1. Client (Frontend)
- React SPA
- Axios for API calls
- JWT token storage (sessionStorage)
- Real-time updates via polling (30s interval)

### 2. Server (Backend)
- Node.js + Express
- TypeScript
- JWT authentication middleware
- Connection pooling (mysql2)
- Activity logging

### 3. Database
- MySQL 5.7+
- 8 tables
- Indexes for performance
- Foreign key constraints

## User Roles

- **SUPER_ADMIN**: Full access, manage admins
- **ADMIN**: Manage data, approve leaves
- **OPERATOR**: Submit reports, manage assignments
- **TEACHER**: Submit leave requests, view own data
- **STUDENT**: Submit reports only

## Authentication Flow

1. User submits credentials
2. Server validates against database
3. Server generates JWT token (24h validity)
4. Client stores token in sessionStorage
5. All API requests include token in Authorization header
6. Server validates token on each request

## Concurrent Access

### How It Works
- Multiple users can access simultaneously
- Each has independent session (JWT token)
- Database handles concurrent reads/writes
- Transactions ensure data integrity

### Real-time Sync
- Polling strategy (30 seconds)
- Refreshes data from server
- Shows updates from other users
- Future: WebSocket for instant updates

## Session Management

- JWT tokens expire after 24 hours
- No server-side session storage
- Stateless authentication
- Auto-logout on token expiry

## Data Consistency

### Optimistic Locking
- User A and B edit same record
- Last write wins
- No conflict resolution yet
- Future: Version numbers

### Transactions
- Teacher leave + assignments = atomic
- Either all succeed or all fail
- Rollback on error

## Security

- Password hashing (bcrypt)
- SQL injection prevention (prepared statements)
- XSS protection (Helmet middleware)
- CORS configuration
- JWT token validation

## Scalability

### Current Capacity
- Up to 50 concurrent users (tested)
- Connection pool: 10 connections
- Suitable for small-medium schools

### Scaling Options
1. **Vertical**: More server RAM/CPU
2. **Horizontal**: Multiple server instances + load balancer
3. **Database**: Read replicas, clustering
4. **Caching**: Redis for frequently accessed data

## Best Practices

### For Users
- Logout when done
- Don't share credentials
- Report issues immediately

### For Administrators
- Regular backups
- Monitor activity logs
- Update passwords periodically
- Keep software updated

### For Developers
- Always use prepared statements
- Log important actions
- Handle errors gracefully
- Test multi-user scenarios

## Future Enhancements

- WebSocket for real-time updates
- Offline mode with sync
- Advanced conflict resolution
- Rate limiting
- API versioning
- GraphQL API option

---

**Version:** 3.0.0  
**Architecture:** Client-Server Multi-User
