// Email service module (uses EmailJS for sending emails)
// Configure with your EmailJS credentials

import { EMAIL_CONFIG } from './constants';

/**
 * Send a transactional email using EmailJS
 * Requires emailjs-com to be installed
 */
export async function sendEmail(to, subject, htmlContent, textContent) {
  try {
    // Check if EmailJS is available
    if (typeof window === 'undefined' || !window.emailjs) {
      console.warn('EmailJS not available, skipping email');
      return { success: false, message: 'Email service not configured' };
    }

    // In a real app, you'd use EmailJS SDK:
    // const response = await window.emailjs.send(
    //   EMAIL_CONFIG.serviceId,
    //   EMAIL_CONFIG.templateId,
    //   {
    //     to_email: to,
    //     to_name: to.split('@')[0],
    //     subject: subject,
    //     html_content: htmlContent,
    //     text_content: textContent,
    //   },
    //   EMAIL_CONFIG.publicKey
    // );

    // For now, we'll log it (demo mode)
    console.log('Email (demo):', { to, subject, htmlContent });

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Send a weekly progress report to parent
 */
export async function sendProgressReport(parentEmail, parentName, childrenProgress) {
  try {
    const subject = `🎓 Weekly Progress Report — NextGen School`;

    // Generate HTML content
    let htmlContent = `
      <h2>Hi ${parentName},</h2>
      <p>Here's what your children accomplished this week:</p>
      <ul>
    `;

    childrenProgress.forEach((child) => {
      htmlContent += `
        <li>
          <strong>${child.name}</strong>:
          Completed ${child.chaptersCompleted} chapters,
          earned ${child.pointsEarned} XP,
          ${child.streakDays > 0 ? `${child.streakDays} day streak! 🔥` : 'Keep the streak going!'}
        </li>
      `;
    });

    htmlContent += `
      </ul>
      <p>Keep up the great work! 🌟</p>
      <p>Visit your <a href="https://nextgenschool.com/dashboard">Parent Dashboard</a> to see detailed analytics.</p>
      <p>Best,<br/>NextGen School Team</p>
    `;

    const textContent = `Hi ${parentName},\n\nHere's what your children accomplished this week:\n\n${childrenProgress
      .map(
        (child) =>
          `${child.name}: Completed ${child.chaptersCompleted} chapters, earned ${child.pointsEarned} XP, ${child.streakDays > 0 ? `${child.streakDays} day streak! 🔥` : 'Keep the streak going!'}`
      )
      .join('\n')}\n\nKeep up the great work! 🌟\n\nBest,\nNextGen School Team`;

    return sendEmail(parentEmail, subject, htmlContent, textContent);
  } catch (error) {
    console.error('Error sending progress report:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Send course completion certificate notification
 */
export async function sendCertificateNotification(parentEmail, parentName, childName, courseName) {
  try {
    const subject = `🎉 ${childName} Completed ${courseName}! — Certificate Ready`;

    const htmlContent = `
      <h2>Congratulations!</h2>
      <p>Hi ${parentName},</p>
      <p><strong>${childName}</strong> has just completed <strong>${courseName}</strong>! 🎉</p>
      <p>A certificate has been generated and is ready to download from the parent dashboard.</p>
      <p><a href="https://nextgenschool.com/dashboard">View Certificate</a></p>
      <p>This is a huge achievement! ${childName} is now learning about the intersection of AI, space exploration, and robotics.</p>
      <p>Best,<br/>NextGen School Team</p>
    `;

    const textContent = `Congratulations!\n\nHi ${parentName},\n\n${childName} has just completed ${courseName}! 🎉\n\nA certificate has been generated and is ready to download from the parent dashboard.\n\nThis is a huge achievement! ${childName} is now learning about the intersection of AI, space exploration, and robotics.\n\nBest,\nNextGen School Team`;

    return sendEmail(parentEmail, subject, htmlContent, textContent);
  } catch (error) {
    console.error('Error sending certificate notification:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Send purchase confirmation email
 */
export async function sendPurchaseConfirmation(parentEmail, parentName, purchaseDetails) {
  try {
    const subject = '💳 Purchase Confirmation — NextGen School';

    const htmlContent = `
      <h2>Thank You for Your Purchase!</h2>
      <p>Hi ${parentName},</p>
      <p>Your purchase has been confirmed.</p>
      <h3>Order Details:</h3>
      <ul>
        <li><strong>Plan:</strong> ${purchaseDetails.planName}</li>
        <li><strong>Amount:</strong> $${purchaseDetails.amount.toFixed(2)} ${purchaseDetails.currency}</li>
        <li><strong>Date:</strong> ${new Date(purchaseDetails.date).toLocaleDateString()}</li>
        <li><strong>Order ID:</strong> ${purchaseDetails.orderId}</li>
      </ul>
      <p>Your children now have full access to all courses. Visit your <a href="https://nextgenschool.com/dashboard">dashboard</a> to get started!</p>
      <p>If you have any questions, feel free to reply to this email.</p>
      <p>Best,<br/>NextGen School Team</p>
    `;

    const textContent = `Thank You for Your Purchase!\n\nHi ${parentName},\n\nYour purchase has been confirmed.\n\nOrder Details:\n- Plan: ${purchaseDetails.planName}\n- Amount: $${purchaseDetails.amount.toFixed(2)} ${purchaseDetails.currency}\n- Date: ${new Date(purchaseDetails.date).toLocaleDateString()}\n- Order ID: ${purchaseDetails.orderId}\n\nYour children now have full access to all courses.\n\nBest,\nNextGen School Team`;

    return sendEmail(parentEmail, subject, htmlContent, textContent);
  } catch (error) {
    console.error('Error sending purchase confirmation:', error);
    return { success: false, message: error.message };
  }
}
