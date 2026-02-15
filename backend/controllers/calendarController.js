// const CalendarEvent = require('../models/CalendarEvent');
// const Program = require('../models/Program');
// const User = require('../models/User');
// const sendEmail = require('../utils/sendEmail');
// const crypto = require('crypto');

// // Send interview booking link
// const sendInterviewBookingLink = async (req, res) => {
//   try {
//     const { userEmail, userName, ticketNumber, userId } = req.body;
    
//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: 'User ID is required'
//       });
//     }

//     // Find user
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Generate secure token
//     const bookingToken = crypto.randomBytes(32).toString('hex');
//     const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

//     // Update user with booking access
//     user.bookingAccess = {
//       token: bookingToken,
//       expiresAt,
//       granted: true,
//       used: false
//     };
//     await user.save();

//     // Create booking link with token
//     const bookingLink = `${process.env.FRONTEND_URL}/user/interview?token=${bookingToken}&uid=${userId}`;
    
//     const html = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//           .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
//                     color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
//           .content { background: #f9fafb; padding: 30px; }
//           .button { display: inline-block; padding: 15px 30px; background: #667eea; 
//                     color: white; text-decoration: none; border-radius: 5px; 
//                     font-weight: bold; margin: 20px 0; }
//           .footer { background: #e5e7eb; padding: 20px; text-align: center; 
//                     border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
//           .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; 
//                       margin: 15px 0; border-radius: 5px; }
//           .warning { background: #fef3c7; border-left: 4px solid #f59e0b; 
//                      padding: 15px; margin: 15px 0; border-radius: 5px; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>📅 Book Your Consultation</h1>
//           </div>
          
//           <div class="content">
//             <h2>Hello ${userName}!</h2>
            
//             <p>You can now book your consultation appointment. Click the button below to access the booking calendar:</p>
            
//             <div style="text-align: center;">
//               <a href="${bookingLink}" class="button">
//                 Book Your Appointment Now
//               </a>
//             </div>
            
//             <div class="info-box">
//               <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
//               <p><strong>What to expect:</strong></p>
//               <ul>
//                 <li>View available dates on the calendar</li>
//                 <li>Select your preferred consultation date</li>
//                 <li>Choose between Online or Face-to-Face consultation</li>
//                 <li>Receive instant confirmation</li>
//               </ul>
//             </div>
            
//             <div class="warning">
//               <p><strong>⏰ IMPORTANT - Time-Sensitive Access:</strong></p>
//               <ul>
//                 <li>🕐 This link expires in <strong>24 hours</strong></li>
//                 <li>📅 You can book <strong>ONE consultation only</strong></li>
//                 <li>🚫 Link cannot be reused after booking</li>
//                 <li>⚠️ Bookings not allowed on weekends and holidays</li>
//                 <li>❌ Past dates cannot be selected</li>
//               </ul>
//               <p style="margin-top: 10px; font-weight: bold;">
//                 ⏳ Expires at: ${expiresAt.toLocaleString('en-US', { 
//                   timeZone: 'Asia/Manila',
//                   dateStyle: 'full',
//                   timeStyle: 'short'
//                 })}
//               </p>
//             </div>
            
//             <p>Or copy this link:</p>
//             <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 5px;">
//               ${bookingLink}
//             </p>
//           </div>
          
//           <div class="footer">
//             <p>This is an automated email from GAD Portal.</p>
//             <p>© 2026 GAD Portal. All rights reserved.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
    
//     await sendEmail({
//       to: userEmail,
//       subject: `🔔 Consultation Booking Link - ${ticketNumber} (Valid for 24 Hours)`,
//       html
//     });
    
//     res.status(200).json({
//       success: true,
//       message: 'Booking link sent successfully',
//       expiresAt
//     });
    
//   } catch (error) {
//     console.error('Error sending booking link:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to send booking link',
//       error: error.message
//     });
//   }
// };

// // Verify booking access token
// const verifyBookingAccess = async (req, res) => {
//   try {
//     const { token, uid } = req.query;

//     if (!token || !uid) {
//       return res.status(400).json({
//         success: false,
//         message: 'Token and user ID are required'
//       });
//     }

//     const user = await User.findById(uid);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Check if booking access exists
//     if (!user.bookingAccess || !user.bookingAccess.granted) {
//       return res.status(403).json({
//         success: false,
//         message: 'No booking access granted'
//       });
//     }

//     // Check if token matches
//     if (user.bookingAccess.token !== token) {
//       return res.status(403).json({
//         success: false,
//         message: 'Invalid booking token'
//       });
//     }

//     // Check if expired (24 hours)
//     if (new Date() > user.bookingAccess.expiresAt) {
//       return res.status(403).json({
//         success: false,
//         message: 'Booking link has expired. Please request a new link.',
//         expired: true
//       });
//     }

//     // Check if already used
//     if (user.bookingAccess.used) {
//       return res.status(403).json({
//         success: false,
//         message: 'You have already booked your consultation',
//         alreadyBooked: true
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Access granted',
//       user: {
//         id: user._id,
//         name: `${user.firstName} ${user.lastName}`,
//         email: user.email
//       },
//       expiresAt: user.bookingAccess.expiresAt
//     });

//   } catch (error) {
//     console.error('Error verifying booking access:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // Mark booking as used after successful booking
// const markBookingAsUsed = async (userId) => {
//   try {
//     const user = await User.findById(userId);
//     if (user && user.bookingAccess) {
//       user.bookingAccess.used = true;
//       await user.save();
//     }
//   } catch (error) {
//     console.error('Error marking booking as used:', error);
//   }
// };

// // Get all calendar events
// const getAllCalendarEvents = async (req, res) => {
//   try {
//     const { startDate, endDate, type } = req.query;

//     const query = {};
//     if (type) query.type = type;
//     if (startDate || endDate) {
//       query.start = {};
//       if (startDate) query.start.$gte = new Date(startDate);
//       if (endDate) query.start.$lte = new Date(endDate);
//     }

//     // ✅ FIXED: Populate userId to get user details
//     const calendarEvents = await CalendarEvent.find(query)
//       .populate('userId', 'firstName lastName email');

//     const programs = await Program.find({ archived: false });
//     const programEvents = [];

//     programs.forEach(program => {
//       program.projects.forEach(project => {
//         project.events.forEach(event => {
//           if (!event.archived) {
//             programEvents.push({
//               id: event._id,
//               title: `${event.title} - ${project.name}`,
//               start: event.date,
//               end: event.date,
//               color: getEventColor('program_event'),
//               extendedProps: {
//                 type: 'program_event',
//                 programName: program.name,
//                 projectName: project.name,
//                 venue: event.venue,
//                 participants: event.participants,
//                 status: event.status,
//                 description: event.description || '',
//                 date: event.date,
//                 _id: event._id
//               }
//             });
//           }
//         });
//       });
//     });

//     const formattedCalendarEvents = calendarEvents.map(event => {
//       // ✅ FIXED: Extract user data from populated userId
//       const user = event.userId;
//       const userName = user 
//         ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
//         : event.extendedProps?.userName || 'Unknown User';
//       const userEmail = user?.email || event.extendedProps?.userEmail || 'N/A';

//       // ✅ Map 'scheduled' to 'upcoming' for frontend display
//       const displayStatus = event.extendedProps?.status === 'scheduled' ? 'upcoming' : event.extendedProps?.status;

//       return {
//         id: event._id,
//         title: event.title,
//         start: event.start,
//         end: event.end,
//         allDay: event.allDay,
//         color: getEventColor(event.type),
//         userId: event.userId?._id, // Keep the ID reference
//         extendedProps: {
//           type: event.type,
//           description: event.description,
//           location: event.location,
//           notes: event.notes,
//           userName: userName,
//           userEmail: userEmail,
//           mode: event.extendedProps?.mode || 'N/A',
//           status: displayStatus || 'upcoming'
//         }
//       };
//     });

//     const allEvents = [...formattedCalendarEvents, ...programEvents];

//     res.status(200).json({
//       success: true,
//       count: allEvents.length,
//       data: allEvents
//     });
//   } catch (error) {
//     console.error('❌ Error fetching calendar events:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: error.message
//     });
//   }
// };

// // Create calendar event
// const createCalendarEvent = async (req, res) => {
//   try {
//     const { type, userId, userName, userEmail, mode, status } = req.body;

//     console.log('📥 Received booking request:', {
//       type,
//       userId,
//       userName,
//       userEmail,
//       mode,
//       status
//     });

//     // Check if user has already booked
//     if (type === 'consultation' && userId) {
//       const existingBooking = await CalendarEvent.findOne({
//         type: 'consultation',
//         userId,
//         'extendedProps.status': { $ne: 'cancelled' }
//       });

//       if (existingBooking) {
//         return res.status(400).json({
//           success: false,
//           message: 'You already booked a consultation.'
//         });
//       }

//       // ✅ Get user data from database OR from request body
//       let finalUserName = userName;
//       let finalUserEmail = userEmail;

//       if (!finalUserName || !finalUserEmail) {
//         const user = await User.findById(userId);
//         if (user) {
//           finalUserName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
//           finalUserEmail = user.email || 'N/A';
//         }
//       }

//       console.log('👤 User info for event:', {
//         finalUserName,
//         finalUserEmail,
//         mode: mode || 'online',
//         status: status || 'upcoming'
//       });

//       // ✅ Ensure extendedProps has all user info
//       req.body.extendedProps = {
//         ...req.body.extendedProps,
//         userName: finalUserName || 'Unknown User',
//         userEmail: finalUserEmail || 'N/A',
//         mode: mode || req.body.extendedProps?.mode || 'online',
//         status: status || req.body.extendedProps?.status || 'scheduled' // ✅ FIXED: Use 'scheduled'
//       };

//       // ✅ FIXED: Also update root-level status if it's 'upcoming'
//       if (req.body.status === 'upcoming') {
//         req.body.status = 'scheduled';
//       }

//       // Mark booking access as used
//       await markBookingAsUsed(userId);
//     }

//     const event = await CalendarEvent.create(req.body);

//     // ✅ Populate user data before sending response
//     await event.populate('userId', 'firstName lastName email');

//     console.log('✅ Event created with user info:', {
//       eventId: event._id,
//       userName: event.extendedProps?.userName,
//       userEmail: event.extendedProps?.userEmail
//     });

//     res.status(201).json({
//       success: true,
//       data: event,
//       message: 'Event created successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error creating calendar event:', error);
    
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         message: 'Validation Error',
//         errors: messages
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: error.message
//     });
//   }
// };

// // Update calendar event
// const updateCalendarEvent = async (req, res) => {
//   try {
//     const event = await CalendarEvent.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     ).populate('userId', 'firstName lastName email');

//     if (!event) {
//       return res.status(404).json({
//         success: false,
//         message: 'Event not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: event,
//       message: 'Event updated successfully'
//     });
//   } catch (error) {
//     console.error('❌ Error updating calendar event:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: error.message
//     });
//   }
// };

// // Delete calendar event
// const deleteCalendarEvent = async (req, res) => {
//   try {
//     const event = await CalendarEvent.findByIdAndDelete(req.params.id);

//     if (!event) {
//       return res.status(404).json({
//         success: false,
//         message: 'Event not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Event deleted successfully',
//       data: {}
//     });
//   } catch (error) {
//     console.error('❌ Error deleting calendar event:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: error.message
//     });
//   }
// };

// // Helper function to get event color
// function getEventColor(type) {
//   const colors = {
//     holiday: '#ef4444',
//     not_available: '#6b7280',
//     consultation: '#8b5cf6',
//     program_event: '#3b82f6',
//     upcoming: '#3b82f6',
//     ongoing: '#f59e0b',
//     completed: '#10b981',
//     cancelled: '#ef4444'
//   };
//   return colors[type] || '#6b7280';
// }

// module.exports = {
//   getAllCalendarEvents,
//   createCalendarEvent,
//   updateCalendarEvent,
//   deleteCalendarEvent,
//   sendInterviewBookingLink,
//   verifyBookingAccess
// };
const CalendarEvent = require('../models/CalendarEvent');
const Program = require('../models/Program');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// ✅ UPDATED: Send interview booking link with report ticket number
const sendInterviewBookingLink = async (req, res) => {
  try {
    const { userEmail, userName, ticketNumber, userId } = req.body;
    
    if (!userId || !ticketNumber) {
      return res.status(400).json({
        success: false,
        message: 'User ID and ticket number are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ✅ Check if user has an active (scheduled/ongoing) booking for this report
    const existingActiveBooking = await CalendarEvent.findOne({
      userId,
      reportTicketNumber: ticketNumber,
      type: 'consultation',
      status: { $in: ['scheduled', 'ongoing'] }
    });

    if (existingActiveBooking) {
      return res.status(400).json({
        success: false,
        message: 'User already has an active booking for this report. They can only rebook if it is cancelled or completed.'
      });
    }

    // Generate secure token
    const bookingToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // ✅ Update user with booking access linked to this report
    user.bookingAccess = {
      token: bookingToken,
      expiresAt,
      granted: true,
      used: false,
      reportTicketNumber: ticketNumber // ✅ Track which report this is for
    };
    await user.save();

    const bookingLink = `${process.env.FRONTEND_URL}/user/interview?token=${bookingToken}&uid=${userId}&ticket=${ticketNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; 
                    color: white; text-decoration: none; border-radius: 5px; 
                    font-weight: bold; margin: 20px 0; }
          .footer { background: #e5e7eb; padding: 20px; text-align: center; 
                    border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; 
                      margin: 15px 0; border-radius: 5px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; 
                     padding: 15px; margin: 15px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Book Your Consultation</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${userName}!</h2>
            
            <p>You can now book your consultation appointment for your report. Click the button below to access the booking calendar:</p>
            
            <div style="text-align: center;">
              <a href="${bookingLink}" class="button">
                Book Your Appointment Now
              </a>
            </div>
            
            <div class="info-box">
              <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
              <p><strong>What to expect:</strong></p>
              <ul>
                <li>View available dates on the calendar</li>
                <li>Select your preferred consultation date</li>
                <li>Choose between Online or Face-to-Face consultation</li>
                <li>Receive instant confirmation</li>
              </ul>
            </div>
            
            <div class="warning">
              <p><strong>⏰ IMPORTANT - Time-Sensitive Access:</strong></p>
              <ul>
                <li>🕐 This link expires in <strong>24 hours</strong></li>
                <li>📅 You can book <strong>ONE consultation per report</strong></li>
                <li>🔄 You can only rebook if your previous booking was <strong>cancelled or completed</strong></li>
                <li>🚫 Link cannot be reused after booking</li>
                <li>⚠️ Bookings not allowed on weekends and holidays</li>
                <li>❌ Past dates cannot be selected</li>
              </ul>
              <p style="margin-top: 10px; font-weight: bold;">
                ⏳ Expires at: ${expiresAt.toLocaleString('en-US', { 
                  timeZone: 'Asia/Manila',
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </p>
            </div>
            
            <p>Or copy this link:</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 5px;">
              ${bookingLink}
            </p>
          </div>
          
          <div class="footer">
            <p>This is an automated email from GAD Portal.</p>
            <p>© 2026 GAD Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await sendEmail({
      to: userEmail,
      subject: `🔔 Consultation Booking Link - ${ticketNumber} (Valid for 24 Hours)`,
      html
    });
    
    res.status(200).json({
      success: true,
      message: 'Booking link sent successfully',
      expiresAt
    });
    
  } catch (error) {
    console.error('Error sending booking link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send booking link',
      error: error.message
    });
  }
};

// ✅ UPDATED: Verify booking access with report ticket validation
const verifyBookingAccess = async (req, res) => {
  try {
    const { token, uid, ticket } = req.query;

    if (!token || !uid || !ticket) {
      return res.status(400).json({
        success: false,
        message: 'Token, user ID, and ticket number are required'
      });
    }

    const user = await User.findById(uid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.bookingAccess || !user.bookingAccess.granted) {
      return res.status(403).json({
        success: false,
        message: 'No booking access granted'
      });
    }

    if (user.bookingAccess.token !== token) {
      return res.status(403).json({
        success: false,
        message: 'Invalid booking token'
      });
    }

    // ✅ Verify the ticket number matches
    if (user.bookingAccess.reportTicketNumber !== ticket) {
      return res.status(403).json({
        success: false,
        message: 'This booking link is for a different report'
      });
    }

    if (new Date() > user.bookingAccess.expiresAt) {
      return res.status(403).json({
        success: false,
        message: 'Booking link has expired. Please request a new link.',
        expired: true
      });
    }

    if (user.bookingAccess.used) {
      return res.status(403).json({
        success: false,
        message: 'You have already booked your consultation for this report',
        alreadyBooked: true
      });
    }

    // ✅ Check for active bookings for this report
    const existingActiveBooking = await CalendarEvent.findOne({
      userId: uid,
      reportTicketNumber: ticket,
      type: 'consultation',
      status: { $in: ['scheduled', 'ongoing'] }
    });

    if (existingActiveBooking) {
      return res.status(403).json({
        success: false,
        message: 'You already have an active booking for this report',
        alreadyBooked: true
      });
    }

    res.status(200).json({
      success: true,
      message: 'Access granted',
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      },
      ticketNumber: ticket,
      expiresAt: user.bookingAccess.expiresAt
    });

  } catch (error) {
    console.error('Error verifying booking access:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ UPDATED: Mark booking as used with report tracking
const markBookingAsUsed = async (userId, ticketNumber) => {
  try {
    const user = await User.findById(userId);
    if (user && user.bookingAccess && user.bookingAccess.reportTicketNumber === ticketNumber) {
      user.bookingAccess.used = true;
      await user.save();
    }
  } catch (error) {
    console.error('Error marking booking as used:', error);
  }
};

// Get all calendar events
const getAllCalendarEvents = async (req, res) => {
  try {
    const { startDate, endDate, type, userId } = req.query;

    const query = {};
    if (type) query.type = type;
    if (userId) query.userId = userId;
    if (startDate || endDate) {
      query.start = {};
      if (startDate) query.start.$gte = new Date(startDate);
      if (endDate) query.start.$lte = new Date(endDate);
    }

    const calendarEvents = await CalendarEvent.find(query)
      .populate('userId', 'firstName lastName email');

    const programs = await Program.find({ archived: false });
    const programEvents = [];

    programs.forEach(program => {
      program.projects.forEach(project => {
        project.events.forEach(event => {
          if (!event.archived) {
            programEvents.push({
              id: event._id,
              title: `${event.title} - ${project.name}`,
              start: event.date,
              end: event.date,
              color: getEventColor('program_event'),
              extendedProps: {
                type: 'program_event',
                programName: program.name,
                projectName: project.name,
                venue: event.venue,
                participants: event.participants,
                status: event.status,
                description: event.description || '',
                date: event.date,
                _id: event._id
              }
            });
          }
        });
      });
    });

    const formattedCalendarEvents = calendarEvents.map(event => {
      // ✅ FIXED: Extract user data from populated userId
      const user = event.userId;
      const userName = user 
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
        : event.extendedProps?.userName || 'Unknown User';
      const userEmail = user?.email || event.extendedProps?.userEmail || 'N/A';

      // ✅ Map 'scheduled' to 'upcoming' for frontend display
      let displayStatus = event.extendedProps?.status === 'scheduled' ? 'upcoming' : event.extendedProps?.status;

      // 🟢 Auto-update status to 'completed' if event end date has passed
      const now = new Date();
      // Use end date if available, otherwise start date
      const eventDate = event.end ? new Date(event.end) : new Date(event.start);
      if ((displayStatus === 'upcoming' || displayStatus === 'scheduled') && eventDate < now) {
        displayStatus = 'completed';
      }

      return {
        _id: event._id, // Use _id for frontend compatibility
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        color: getEventColor(event.type),
        userId: event.userId?._id, // Keep the ID reference
        reportTicketNumber: event.reportTicketNumber, // <-- Ensure this is sent to frontend
        extendedProps: {
          type: event.type,
          description: event.description,
          location: event.location,
          notes: event.notes,
          userName: userName,
          userEmail: userEmail,
          mode: event.extendedProps?.mode || 'N/A',
          status: displayStatus || 'upcoming'
        }
      };
    });

    const allEvents = [...formattedCalendarEvents, ...programEvents];

    res.status(200).json({
      success: true,
      count: allEvents.length,
      data: allEvents
    });
  } catch (error) {
    console.error('❌ Error fetching calendar events:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ✅ FIXED: Proper date handling for FormData
const createCalendarEvent = async (req, res) => {
  try {
    console.log('🟢 Incoming createCalendarEvent request:', {
      body: req.body,
      files: req.files
    });

    const { type, userId, userName, userEmail, mode, status, reportTicketNumber } = req.body;

    console.log('📥 Received booking request:', {
      type,
      userId,
      userName,
      userEmail,
      mode,
      status,
      reportTicketNumber
    });

    // ✅ CRITICAL FIX: When using FormData, all fields come as strings
    // Convert string booleans and prepare data for database
    const eventData = {
      title: req.body.title?.trim(),
      type: req.body.type?.trim(),
      // ✅ Convert date strings to proper Date objects
      start: req.body.start ? new Date(req.body.start) : undefined,
      end: req.body.end ? new Date(req.body.end) : undefined,
      location: req.body.location?.trim() || undefined,
      description: req.body.description?.trim() || undefined,
      notes: req.body.notes?.trim() || undefined,
      // ✅ Convert string boolean to actual boolean
      allDay: req.body.allDay === 'true' || req.body.allDay === true,
      color: req.body.color || undefined,
      userId: req.body.userId || undefined,
      reportTicketNumber: req.body.reportTicketNumber || undefined
    };

    console.log('🟣 Processed event data:', {
      ...eventData,
      startType: typeof eventData.start,
      endType: typeof eventData.end,
      allDayType: typeof eventData.allDay
    });

    if (type === 'consultation' && userId) {
      if (!reportTicketNumber) {
        return res.status(400).json({
          success: false,
          message: 'Report ticket number is required for consultations'
        });
      }

      // ✅ Check if user has an active booking for THIS specific report
      const existingActiveBooking = await CalendarEvent.findOne({
        type: 'consultation',
        userId,
        reportTicketNumber,
        status: { $in: ['scheduled', 'ongoing'] }
      });

      if (existingActiveBooking) {
        return res.status(400).json({
          success: false,
          message: 'You already have an active booking for this report. You can only rebook if it is cancelled or completed.'
        });
      }

      // Get user data
      let finalUserName = userName;
      let finalUserEmail = userEmail;

      if (!finalUserName || !finalUserEmail) {
        const user = await User.findById(userId);
        if (user) {
          finalUserName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
          finalUserEmail = user.email || 'N/A';
        }
      }

      console.log('👤 User info for event:', {
        finalUserName,
        finalUserEmail,
        mode: mode || 'online',
        status: status || 'upcoming',
        reportTicketNumber
      });

      eventData.extendedProps = {
        userName: finalUserName || 'Unknown User',
        userEmail: finalUserEmail || 'N/A',
        mode: mode || 'online',
        status: status === 'upcoming' ? 'scheduled' : status || 'scheduled',
        reportTicketNumber
      };

      // ✅ Set root-level status (convert 'upcoming' to 'scheduled')
      eventData.status = status === 'upcoming' ? 'scheduled' : status || 'scheduled';

      // Mark booking access as used for this specific report
      await markBookingAsUsed(userId, reportTicketNumber);
    }

    // Handle file uploads
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        url: file.path || file.secure_url || file.url,
        public_id: file.public_id || file.filename,
        type: file.mimetype.startsWith('image') ? 'image' : 
              file.mimetype.startsWith('video') ? 'video' : 
              file.mimetype.startsWith('application') ? 'document' : 'other',
        originalName: file.originalname,
        format: file.format || file.mimetype,
        bytes: file.size,
        uploadedAt: new Date()
      }));
      eventData.attachments = attachments;
    }

    console.log('💾 Final data to save:', eventData);

    const event = await CalendarEvent.create(eventData);
    await event.populate('userId', 'firstName lastName email');

    console.log('✅ Event created successfully:', {
      eventId: event._id,
      userName: event.extendedProps?.userName,
      userEmail: event.extendedProps?.userEmail,
      reportTicketNumber: event.reportTicketNumber
    });

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating calendar event:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('❌ Validation errors:', messages);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    console.error('❌ Server error details:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      files: req.files
    });
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const updateCalendarEvent = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // Map frontend status to valid root-level status
    if (updateData.status) {
      if (updateData.status === 'upcoming') {
        updateData.status = 'scheduled';
      } else if (updateData.status === 'completed') {
        updateData.status = 'completed';
      } else if (updateData.status === 'cancelled') {
        updateData.status = 'cancelled';
      } else if (updateData.status === 'ongoing') {
        updateData.status = 'ongoing';
      }
    }

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        url: file.path || file.location || file.url || '',
        public_id: file.public_id || undefined,
        type: file.mimetype.startsWith('image/') ? 'image' : file.mimetype.startsWith('video/') ? 'video' : 'document',
        originalName: file.originalname || file.filename || '',
        format: file.mimetype ? file.mimetype.split('/')[1] : undefined,
        bytes: file.size || file.bytes || undefined,
        uploadedAt: new Date()
      }));
      updateData.attachments = attachments;
    }

    const event = await CalendarEvent.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const deleteCalendarEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('❌ Error deleting calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

function getEventColor(type) {
  const colors = {
    holiday: '#ef4444',
    not_available: '#6b7280',
    consultation: '#8b5cf6',
    program_event: '#3b82f6',
    upcoming: '#3b82f6',
    ongoing: '#f59e0b',
    completed: '#10b981',
    cancelled: '#ef4444'
  };
  return colors[type] || '#6b7280';
}

module.exports = {
  getAllCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  sendInterviewBookingLink,
  verifyBookingAccess
};