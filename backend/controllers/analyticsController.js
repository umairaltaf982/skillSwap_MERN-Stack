const User = require('../models/User');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');
const Project = require('../models/Project');
const Bid = require('../models/Bid');
const Review = require('../models/Review');
const Payment = require('../models/Payment');

// Helper function to get date range based on timeframe
const getDateRange = (timeframe) => {
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1); // Default to 1 month
  }
  
  return { startDate, endDate: now };
};

// @desc    Get platform analytics overview
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    const { timeframe = 'month' } = req.query;
    const { startDate, endDate } = getDateRange(timeframe);
    
    // User growth analytics
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Project analytics
    const projectsByCategory = await Project.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Revenue analytics
    const revenueByMonth = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Popular skills analytics
    const popularSkills = await Freelancer.aggregate([
      {
        $unwind: '$skills'
      },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Format the data for frontend consumption
    const formattedData = {
      users: {
        total: await User.countDocuments(),
        clients: await Client.countDocuments(),
        freelancers: await Freelancer.countDocuments(),
        admins: await User.countDocuments({ role: 'admin' }),
        growth: {
          labels: userGrowth.map(item => item._id),
          data: userGrowth.map(item => item.count)
        }
      },
      projects: {
        total: await Project.countDocuments(),
        open: await Project.countDocuments({ status: 'open' }),
        inProgress: await Project.countDocuments({ status: 'in-progress' }),
        completed: await Project.countDocuments({ status: 'completed' }),
        cancelled: await Project.countDocuments({ status: 'cancelled' }),
        byCategory: {
          labels: projectsByCategory.map(item => item._id),
          data: projectsByCategory.map(item => item.count)
        }
      },
      revenue: {
        total: (await Payment.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]))[0]?.total || 0,
        monthly: {
          labels: revenueByMonth.map(item => item._id),
          data: revenueByMonth.map(item => item.total)
        }
      },
      skills: {
        popular: {
          labels: popularSkills.map(item => item._id),
          data: popularSkills.map(item => item.count)
        }
      }
    };
    
    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user analytics
// @route   GET /api/admin/analytics/users
// @access  Private (Admin only)
exports.getUserAnalytics = async (req, res, next) => {
  try {
    const { timeframe = 'month' } = req.query;
    const { startDate, endDate } = getDateRange(timeframe);
    
    // User registration over time
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          clients: {
            $sum: {
              $cond: [{ $eq: ['$role', 'client'] }, 1, 0]
            }
          },
          freelancers: {
            $sum: {
              $cond: [{ $eq: ['$role', 'freelancer'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // User locations
    const usersByLocation = await User.aggregate([
      {
        $match: {
          location: { $exists: true, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Format the data for frontend consumption
    const formattedData = {
      registrations: {
        labels: userRegistrations.map(item => item._id),
        datasets: [
          {
            label: 'Total',
            data: userRegistrations.map(item => item.count)
          },
          {
            label: 'Clients',
            data: userRegistrations.map(item => item.clients)
          },
          {
            label: 'Freelancers',
            data: userRegistrations.map(item => item.freelancers)
          }
        ]
      },
      locations: {
        labels: usersByLocation.map(item => item._id),
        data: usersByLocation.map(item => item.count)
      },
      verificationStats: {
        verified: await Freelancer.countDocuments({ verified: true }),
        pending: await Freelancer.countDocuments({
          'verificationDocuments.status': 'Pending'
        }),
        basic: await Freelancer.countDocuments({ verificationLevel: 'Basic' }),
        verified: await Freelancer.countDocuments({ verificationLevel: 'Verified' }),
        premium: await Freelancer.countDocuments({ verificationLevel: 'Premium' })
      }
    };
    
    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (err) {
    next(err);
  }
};
