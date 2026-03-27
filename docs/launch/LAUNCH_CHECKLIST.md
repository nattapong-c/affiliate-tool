# Keyword Generator - Launch Checklist

## Pre-Launch

### Code Quality
- [ ] All tests passing (`bun test` in both service and app)
- [ ] Code reviewed by team member
- [ ] No TypeScript errors (`bun run typecheck`)
- [ ] Linting passes (`bun run lint`)
- [ ] No console errors in browser

### Backend
- [ ] Environment variables configured in production
  - [ ] `MONGODB_URI`
  - [ ] `OPENAI_API_KEY`
  - [ ] `PORT`
  - [ ] `DISCORD_WEBHOOK_URL`
- [ ] MongoDB connection working
- [ ] OpenAI API key configured and tested
- [ ] Rate limiting enabled and configured
- [ ] Error handling tested
- [ ] Logging configured (Pino)
- [ ] CORS configured for frontend domain

### Frontend
- [ ] API URL configured (`NEXT_PUBLIC_API_URL`)
- [ ] Error handling implemented
- [ ] Loading states working
- [ ] Mobile responsive tested
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Build succeeds (`bun run build`)

### Database
- [ ] MongoDB Atlas cluster created (or local MongoDB running)
- [ ] Database user created with proper permissions
- [ ] Connection string tested
- [ ] Indexes created for performance

### Documentation
- [ ] README.md updated
- [ ] API documentation complete
- [ ] User guide created
- [ ] Troubleshooting guide added
- [ ] AGENTS.md reflects current state

## Launch

### Deployment
- [ ] Backend deployed to production server
- [ ] Frontend deployed to Vercel/Netlify/production
- [ ] Database migrations run
- [ ] Environment variables set in production
- [ ] Health checks passing (`/api/health`)

### Monitoring
- [ ] Logging enabled in production
- [ ] Error tracking configured (optional: Sentry)
- [ ] Performance monitoring enabled
- [ ] Alerts configured for:
  - [ ] Service downtime
  - [ ] High error rate
  - [ ] Slow response times
  - [ ] OpenAI API errors

### Security
- [ ] API keys secured (not in code)
- [ ] CORS configured for specific domains
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] MongoDB authentication enabled

## Post-Launch

### Verification
- [ ] Smoke tests pass in production
  - [ ] Health endpoint responds
  - [ ] Keyword generation works
  - [ ] History loads
  - [ ] Frontend connects to backend
- [ ] Real user flow tested
- [ ] Performance metrics acceptable
- [ ] No errors in logs (first 30 minutes)

### Communication
- [ ] Team notified of launch
- [ ] Discord announcement sent
- [ ] Documentation published
- [ ] Stakeholders informed

### Metrics to Monitor

| Metric | Target | Actual |
|--------|--------|--------|
| Response Time | < 5s | _ |
| Error Rate | < 1% | _ |
| Cache Hit Rate | > 80% | _ |
| Concurrent Users | 10+ | _ |

## Rollback Plan

If issues occur after launch:

1. **Immediate**: Revert to previous deployment
2. **Investigate**: Check logs and error reports
3. **Fix**: Address root cause
4. **Test**: Re-run test suite
5. **Re-deploy**: Deploy fix with monitoring

### Rollback Commands

```bash
# Backend rollback (example - depends on deployment method)
cd service
git revert HEAD
bun install
bun run build
pm2 restart all

# Frontend rollback (Vercel example)
vercel rollback
```

## Post-Launch Tasks

- [ ] Monitor for 24 hours
- [ ] Collect user feedback
- [ ] Review error logs
- [ ] Plan Phase 2 (Post Scout)
- [ ] Document lessons learned

---

## Launch Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| Reviewer | | | |
| Product Owner | | | |

**Launch Date**: _______________
**Launch Time**: _______________
**Status**: ⬜ Ready / ⬜ Blocked / ✅ Complete

---

**Last Updated**: March 27, 2026
**Version**: 1.0
