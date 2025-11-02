const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    // Chat identification
    chatId: {
        type: String,
        unique: true,
        required: true,
        default: () => `CHAT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },

    // Participants
    participants: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        stylistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StylistProfile",
            required: true
        }
    },

    // Related booking (optional - for booking-specific chats)
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StylistBooking"
    },

    // Chat status
    status: {
        type: String,
        enum: ['active', 'archived', 'blocked', 'deleted'],
        default: 'active'
    },

    // Last message info
    lastMessage: {
        content: String,
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'file', 'video', 'audio', 'system'],
            default: 'text'
        }
    },

    // Unread message counts
    unreadCounts: {
        user: {
            type: Number,
            default: 0
        },
        stylist: {
            type: Number,
            default: 0
        }
    },

    // Chat settings
    settings: {
        allowNotifications: {
            type: Boolean,
            default: true
        },
        autoArchive: {
            type: Boolean,
            default: false
        },
        muteUntil: {
            type: Date
        }
    },

    // Metadata
    metadata: {
        initiatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        initiatedAt: {
            type: Date,
            default: Date.now
        },
        totalMessages: {
            type: Number,
            default: 0
        }
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Message subdocument schema
const messageSchema = new mongoose.Schema({
    messageId: {
        type: String,
        unique: true,
        required: true,
        default: () => `MSG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },

    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    },

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    content: {
        type: String,
        required: true
    },

    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'video', 'audio', 'system', 'booking_request', 'booking_confirmed', 'booking_cancelled', 'payment_request', 'payment_completed'],
        default: 'text'
    },

    // For media messages
    mediaUrl: {
        type: String
    },

    mediaMetadata: {
        fileName: String,
        fileSize: Number,
        mimeType: String,
        duration: Number, // For audio/video
        dimensions: {
            width: Number,
            height: Number
        }
    },

    // Message status
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed'],
        default: 'sent'
    },

    // Read receipts
    readBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Reply to another message
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },

    // Message reactions
    reactions: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        emoji: String,
        reactedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // System message data
    systemData: {
        type: {
            type: String,
            enum: ['booking_created', 'booking_confirmed', 'booking_cancelled', 'payment_initiated', 'payment_completed', 'video_call_started', 'video_call_ended']
        },
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StylistBooking"
        },
        metadata: mongoose.Schema.Types.Mixed
    },

    // Message flags
    isEdited: {
        type: Boolean,
        default: false
    },

    editedAt: {
        type: Date
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date
    },

    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for Chat
chatSchema.index({ 'participants.userId': 1, 'participants.stylistId': 1 });
chatSchema.index({ bookingId: 1 });
chatSchema.index({ status: 1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });

// Indexes for Message
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ messageType: 1 });
messageSchema.index({ status: 1 });

// Pre-save middleware
chatSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

messageSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Static methods for Chat
chatSchema.statics.findOrCreateChat = async function (userId, stylistId, bookingId = null) {
    try {
        // Try to find existing chat
        let chat = await this.findOne({
            'participants.userId': userId,
            'participants.stylistId': stylistId,
            status: 'active'
        });

        if (!chat) {
            // Create new chat
            chat = new this({
                participants: {
                    userId: userId,
                    stylistId: stylistId
                },
                bookingId: bookingId,
                metadata: {
                    initiatedBy: userId,
                    initiatedAt: new Date()
                }
            });
            await chat.save();
        }

        return {
            success: true,
            data: chat
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            error: error
        };
    }
};

// Instance methods for Chat
chatSchema.methods.markAsRead = function (userId) {
    if (this.participants.userId.toString() === userId.toString()) {
        this.unreadCounts.user = 0;
    } else if (this.participants.stylistId.toString() === userId.toString()) {
        this.unreadCounts.stylist = 0;
    }
    return this.save();
};

chatSchema.methods.incrementUnreadCount = function (userId) {
    if (this.participants.userId.toString() === userId.toString()) {
        this.unreadCounts.user += 1;
    } else if (this.participants.stylistId.toString() === userId.toString()) {
        this.unreadCounts.stylist += 1;
    }
    return this.save();
};

// Static methods for Message
messageSchema.statics.getChatMessages = async function (chatId, page = 1, limit = 50) {
    try {
        const skip = (page - 1) * limit;

        const messages = await this.find({
            chatId: chatId,
            isDeleted: false
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('senderId', 'displayName email')
            .populate('replyTo');

        return {
            success: true,
            data: messages.reverse() // Return in chronological order
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            error: error
        };
    }
};

// Instance methods for Message
messageSchema.methods.markAsRead = function (userId) {
    const existingRead = this.readBy.find(read =>
        read.userId.toString() === userId.toString()
    );

    if (!existingRead) {
        this.readBy.push({
            userId: userId,
            readAt: new Date()
        });
        this.status = 'read';
        return this.save();
    }

    return Promise.resolve();
};

messageSchema.methods.addReaction = function (userId, emoji) {
    const existingReaction = this.reactions.find(reaction =>
        reaction.userId.toString() === userId.toString()
    );

    if (existingReaction) {
        existingReaction.emoji = emoji;
        existingReaction.reactedAt = new Date();
    } else {
        this.reactions.push({
            userId: userId,
            emoji: emoji,
            reactedAt: new Date()
        });
    }

    return this.save();
};

messageSchema.methods.removeReaction = function (userId) {
    this.reactions = this.reactions.filter(reaction =>
        reaction.userId.toString() !== userId.toString()
    );
    return this.save();
};

// Create models
const Chat = mongoose.model("Chat", chatSchema);
const Message = mongoose.model("Message", messageSchema);

module.exports = { Chat, Message };
