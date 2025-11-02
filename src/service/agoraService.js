const RtcTokenBuilder = require('agora-access-token').RtcTokenBuilder;
const RtcRole = require('agora-access-token').RtcRole;
const RtmTokenBuilder = require('agora-access-token').RtmTokenBuilder;
const RtmRole = require('agora-access-token').RtmRole;

class AgoraService {

    /**
     * Generate RTC token for video calls
     * @param {string} channelName - Channel name
     * @param {string} uid - User ID
     * @param {number} role - User role (1 = publisher, 2 = subscriber)
     * @param {number} expirationTimeInSeconds - Token expiration time
     * @returns {Object} - Token response
     */
    static generateRtcToken(channelName, uid, role = RtcRole.PUBLISHER, expirationTimeInSeconds = 3600) {
        try {
            const appId = process.env.AGORA_APP_ID;
            const appCertificate = process.env.AGORA_APP_CERTIFICATE;

            if (!appId || !appCertificate) {
                throw new Error('Agora credentials not configured');
            }

            const currentTimestamp = Math.floor(Date.now() / 1000);
            const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

            const token = RtcTokenBuilder.buildTokenWithUid(
                appId,
                appCertificate,
                channelName,
                uid,
                role,
                privilegeExpiredTs
            );

            return {
                success: true,
                data: {
                    token: token,
                    appId: appId,
                    channelName: channelName,
                    uid: uid,
                    role: role,
                    expirationTime: privilegeExpiredTs,
                    expiresIn: expirationTimeInSeconds
                }
            };
        } catch (error) {
            console.error('Agora RTC token generation error:', error);
            return {
                success: false,
                message: error.message || 'Failed to generate RTC token',
                error: error
            };
        }
    }

    /**
     * Generate RTM token for messaging
     * @param {string} uid - User ID
     * @param {number} expirationTimeInSeconds - Token expiration time
     * @returns {Object} - Token response
     */
    static generateRtmToken(uid, expirationTimeInSeconds = 3600) {
        try {
            const appId = process.env.AGORA_APP_ID;
            const appCertificate = process.env.AGORA_APP_CERTIFICATE;

            if (!appId || !appCertificate) {
                throw new Error('Agora credentials not configured');
            }

            const currentTimestamp = Math.floor(Date.now() / 1000);
            const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

            const token = RtmTokenBuilder.buildToken(
                appId,
                appCertificate,
                uid,
                RtmRole.Rtm_User,
                privilegeExpiredTs
            );

            return {
                success: true,
                data: {
                    token: token,
                    appId: appId,
                    uid: uid,
                    expirationTime: privilegeExpiredTs,
                    expiresIn: expirationTimeInSeconds
                }
            };
        } catch (error) {
            console.error('Agora RTM token generation error:', error);
            return {
                success: false,
                message: error.message || 'Failed to generate RTM token',
                error: error
            };
        }
    }

    /**
     * Generate both RTC and RTM tokens for a user
     * @param {string} channelName - Channel name
     * @param {string} uid - User ID
     * @param {number} expirationTimeInSeconds - Token expiration time
     * @returns {Object} - Combined token response
     */
    static generateTokens(channelName, uid, expirationTimeInSeconds = 3600) {
        try {
            const rtcTokenResult = this.generateRtcToken(channelName, uid, RtcRole.PUBLISHER, expirationTimeInSeconds);
            const rtmTokenResult = this.generateRtmToken(uid, expirationTimeInSeconds);

            if (!rtcTokenResult.success || !rtmTokenResult.success) {
                return {
                    success: false,
                    message: 'Failed to generate one or more tokens',
                    errors: {
                        rtc: rtcTokenResult.message,
                        rtm: rtmTokenResult.message
                    }
                };
            }

            return {
                success: true,
                data: {
                    rtcToken: rtcTokenResult.data,
                    rtmToken: rtmTokenResult.data,
                    channelName: channelName,
                    uid: uid,
                    expirationTime: rtcTokenResult.data.expirationTime,
                    expiresIn: expirationTimeInSeconds
                }
            };
        } catch (error) {
            console.error('Agora token generation error:', error);
            return {
                success: false,
                message: error.message || 'Failed to generate tokens',
                error: error
            };
        }
    }

    /**
     * Generate channel name for booking
     * @param {string} bookingId - Booking ID
     * @param {string} stylistId - Stylist ID
     * @param {string} userId - User ID
     * @returns {string} - Channel name
     */
    static generateChannelName(bookingId, stylistId, userId) {
        return `booking_${bookingId}_${stylistId}_${userId}`;
    }

    /**
     * Validate channel name format
     * @param {string} channelName - Channel name to validate
     * @returns {boolean} - Validation result
     */
    static validateChannelName(channelName) {
        const pattern = /^booking_[a-f0-9]{24}_[a-f0-9]{24}_[a-f0-9]{24}$/;
        return pattern.test(channelName);
    }

    /**
     * Extract booking details from channel name
     * @param {string} channelName - Channel name
     * @returns {Object|null} - Booking details or null if invalid
     */
    static extractBookingDetails(channelName) {
        if (!this.validateChannelName(channelName)) {
            return null;
        }

        const parts = channelName.split('_');
        if (parts.length !== 4) {
            return null;
        }

        return {
            bookingId: parts[1],
            stylistId: parts[2],
            userId: parts[3]
        };
    }

    /**
     * Generate user-specific channel name for messaging
     * @param {string} userId - User ID
     * @param {string} stylistId - Stylist ID
     * @returns {string} - Channel name for messaging
     */
    static generateMessageChannelName(userId, stylistId) {
        return `chat_${userId}_${stylistId}`;
    }

    /**
     * Get Agora configuration for client
     * @returns {Object} - Agora configuration
     */
    static getClientConfig() {
        return {
            appId: process.env.AGORA_APP_ID,
            tokenExpirationTime: 3600,
            defaultChannelProfile: 0, // Communication profile
            defaultClientRole: 1, // Publisher role
            defaultVideoProfile: 0, // 640x480, 15fps
            defaultAudioProfile: 0, // Default audio profile
            logLevel: 2, // Info level
            logFilter: 0x0f // All logs
        };
    }

    /**
     * Generate meeting room configuration
     * @param {Object} bookingData - Booking data
     * @returns {Object} - Meeting room configuration
     */
    static generateMeetingConfig(bookingData) {
        const channelName = this.generateChannelName(
            bookingData.bookingId,
            bookingData.stylistId,
            bookingData.userId
        );

        const rtcTokenResult = this.generateRtcToken(channelName, bookingData.userId);
        const rtmTokenResult = this.generateRtmToken(bookingData.userId);

        return {
            success: rtcTokenResult.success && rtmTokenResult.success,
            data: {
                channelName: channelName,
                appId: process.env.AGORA_APP_ID,
                rtcToken: rtcTokenResult.data?.token,
                rtmToken: rtmTokenResult.data?.token,
                userId: bookingData.userId,
                stylistId: bookingData.stylistId,
                bookingId: bookingData.bookingId,
                expirationTime: rtcTokenResult.data?.expirationTime,
                expiresIn: 3600
            },
            errors: {
                rtc: rtcTokenResult.message,
                rtm: rtmTokenResult.message
            }
        };
    }

    /**
     * Check if token is expired
     * @param {number} expirationTime - Token expiration timestamp
     * @returns {boolean} - True if expired
     */
    static isTokenExpired(expirationTime) {
        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime >= expirationTime;
    }

    /**
     * Refresh tokens if needed
     * @param {string} channelName - Channel name
     * @param {string} uid - User ID
     * @param {number} currentExpirationTime - Current token expiration time
     * @param {number} bufferTime - Buffer time in seconds before expiration
     * @returns {Object} - Refresh result
     */
    static refreshTokensIfNeeded(channelName, uid, currentExpirationTime, bufferTime = 300) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiration = currentExpirationTime - currentTime;

        if (timeUntilExpiration <= bufferTime) {
            return this.generateTokens(channelName, uid);
        }

        return {
            success: true,
            message: 'Tokens are still valid',
            data: {
                needsRefresh: false,
                timeUntilExpiration: timeUntilExpiration
            }
        };
    }
}

module.exports = AgoraService;
