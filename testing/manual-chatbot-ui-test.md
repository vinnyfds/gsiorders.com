# Chatbot UI Testing Guide

## ✅ API Backend Test Results
**Status**: ✅ WORKING  
**Test**: `POST /api/chatbot` with new Anthropic API key  
**Response**: Success (200 OK)  
**Content**: Proper Liquid Heaven product recommendations  

## 🎯 Frontend UI Testing Checklist

### 1. Chat Trigger Button
- [ ] **Location**: Bottom-right corner of every page
- [ ] **Visibility**: Floating button with chat icon
- [ ] **Hover Effect**: Button responds to mouse hover
- [ ] **Click Action**: Opens chat widget modal

### 2. Chat Widget Modal
- [ ] **Modal Opens**: Clicking trigger button opens chat interface
- [ ] **Modal Closes**: Backdrop click or X button closes modal
- [ ] **Responsive Design**: Works on mobile and desktop
- [ ] **Keyboard Navigation**: Enter to send, Escape to close

### 3. Message Interface
- [ ] **Input Field**: Text input for user messages
- [ ] **Send Button**: Clickable send button
- [ ] **Message History**: Previous messages displayed
- [ ] **User/Bot Distinction**: Different styling for user vs bot messages

### 4. Real-time Functionality
- [ ] **Message Sending**: User can type and send messages
- [ ] **API Integration**: Messages sent to `/api/chatbot`
- [ ] **Response Display**: Bot responses appear in chat
- [ ] **Loading States**: Loading indicator during API calls

### 5. Error Handling
- [ ] **Network Errors**: Graceful handling of API failures
- [ ] **Empty Messages**: Validation prevents empty sends
- [ ] **User Feedback**: Clear error messages displayed

## 🧪 Manual Testing Steps

### Step 1: Access the Website
1. Open browser to `http://localhost:3000`
2. Verify homepage loads without errors
3. Check for chat trigger button (bottom-right)

### Step 2: Test Chat Trigger
1. Click the chat trigger button
2. Verify chat widget modal opens
3. Check modal positioning and styling

### Step 3: Test Message Sending
1. Type a test message: "What products do you have?"
2. Click send or press Enter
3. Verify message appears in chat history
4. Check for loading indicator

### Step 4: Test Bot Response
1. Wait for bot response
2. Verify response appears in chat
3. Check response content is relevant to Liquid Heaven
4. Verify response formatting is readable

### Step 5: Test Multiple Messages
1. Send another message: "Tell me about CBD benefits"
2. Verify conversation history is maintained
3. Check both messages and responses are visible

### Step 6: Test Modal Controls
1. Click outside modal (backdrop)
2. Verify modal closes
3. Reopen modal and test X button
4. Test Escape key to close

### Step 7: Test Mobile Responsiveness
1. Resize browser to mobile width
2. Verify chat trigger is accessible
3. Test modal opens and functions on mobile
4. Check touch interactions work

## 📱 Browser Testing Matrix

| Browser | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| Chrome | ✅ | ✅ | Test |
| Firefox | ✅ | ✅ | Test |
| Safari | ✅ | ✅ | Test |
| Edge | ✅ | ✅ | Test |

## 🚨 Expected Issues & Solutions

### Issue: Chat trigger not visible
**Solution**: Check if ChatTrigger component is mounted in Layout.tsx

### Issue: Modal doesn't open
**Solution**: Verify ChatWidget component is properly imported and rendered

### Issue: Messages not sending
**Solution**: Check browser console for API errors, verify ANTHROPIC_API_KEY

### Issue: No bot response
**Solution**: Check network tab for API call status, verify API key is valid

## ✅ Success Criteria

- [ ] Chat trigger button visible on all pages
- [ ] Chat widget opens and closes properly
- [ ] User can send messages successfully
- [ ] Bot responds with relevant Liquid Heaven information
- [ ] Conversation history is maintained
- [ ] Mobile responsive design works
- [ ] Error handling provides user feedback
- [ ] No console errors during normal operation

## 📊 Test Results Template

```
Date: [Current Date]
Tester: [Your Name]
Browser: [Browser + Version]
Device: [Desktop/Mobile]

✅ Chat Trigger: [Working/Not Working]
✅ Chat Widget: [Working/Not Working]
✅ Message Sending: [Working/Not Working]
✅ Bot Responses: [Working/Not Working]
✅ Mobile Responsive: [Working/Not Working]
✅ Error Handling: [Working/Not Working]

Issues Found:
- [List any issues encountered]

Overall Status: [PASS/FAIL]
```

---

**Next Steps**: Run through this checklist manually in your browser to verify the chatbot UI is fully functional. 