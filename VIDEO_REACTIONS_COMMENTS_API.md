# Video Reactions & Comments API Documentation

## Overview
This document describes the enhanced content video system with like/dislike reactions and comprehensive comment functionality. Users can now react to videos and engage through comments.

## Features
- **Like/Dislike System**: Users can like or dislike videos with toggle functionality
- **Comment System**: Full CRUD operations for comments on videos
- **User Reactions**: Track individual user reactions for personalized experiences
- **Comment Pagination**: Efficient comment loading with pagination
- **Comment Moderation**: Users can edit/delete their own comments, admins can delete any comment
- **Real-time Updates**: Immediate feedback on reactions and comments

## Database Schema Updates

### Content Video Model
```javascript
{
  // ... existing fields ...
  no_of_likes: {
    type: Number,
    default: 0,
  },
  no_of_dislikes: {
    type: Number,
    default: 0,
  },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  dislikedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      commentText: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}
```

## API Endpoints

### 1. Toggle Video Reaction (Like/Dislike)
**POST** `/content-video/videos/:videoId/reaction`

Toggle like or dislike for a video. Users can only have one reaction at a time.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer jwt_token
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "reactionType": "like"
}
```

**Response:**
```json
{
  "message": "Video liked successfully",
  "action": "added",
  "reactionType": "like",
  "video": {
    "_id": "video_id",
    "title": "Spring Fashion Show 2024",
    "videoUrl": "https://example.com/video.mp4",
    "no_of_likes": 15,
    "no_of_dislikes": 2,
    "no_of_Shares": 5,
    "is_approved": true,
    "createdDate": "2024-01-15T10:00:00.000Z",
    "userId": {
      "_id": "user_id",
      "displayName": "Designer Name",
      "email": "designer@example.com"
    },
    "products": [...],
    "userReaction": "like"
  }
}
```

### 2. Get User Reaction
**GET** `/content-video/videos/:videoId/reaction/:userId`

Get the current reaction of a specific user for a video.

**Response:**
```json
{
  "videoId": "video_id",
  "userId": "user_id",
  "userReaction": "like",
  "hasLiked": true,
  "hasDisliked": false
}
```

### 3. Get Users Who Liked a Video
**GET** `/content-video/videos/:videoId/liked-users`

Get paginated list of users who liked a video.

**Query Parameters:**
- `limit` (optional): Number of users per page (default: 20)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "users": [
    {
      "_id": "user_id_1",
      "displayName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "profilePicture": "https://example.com/profile1.jpg"
    },
    {
      "_id": "user_id_2",
      "displayName": "Jane Smith",
      "email": "jane@example.com",
      "phoneNumber": "+1234567891",
      "profilePicture": "https://example.com/profile2.jpg"
    }
  ],
  "totalUsers": 15,
  "currentPage": 1,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false
}
```

### 4. Get Users Who Disliked a Video
**GET** `/content-video/videos/:videoId/disliked-users`

Get paginated list of users who disliked a video.

**Query Parameters:**
- `limit` (optional): Number of users per page (default: 20)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "users": [
    {
      "_id": "user_id_3",
      "displayName": "Bob Wilson",
      "email": "bob@example.com",
      "phoneNumber": "+1234567892",
      "profilePicture": "https://example.com/profile3.jpg"
    }
  ],
  "totalUsers": 1,
  "currentPage": 1,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false
}
```

### 5. Add Comment
**POST** `/content-video/videos/:videoId/comments`

Add a new comment to a video.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer jwt_token
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "commentText": "Amazing fashion show! Love the designs."
}
```

**Response:**
```json
{
  "message": "Comment added successfully",
  "comment": {
    "_id": "comment_id",
    "userId": {
      "_id": "user_id",
      "displayName": "User Name",
      "email": "user@example.com",
      "phoneNumber": "+1234567890",
      "profilePicture": "https://example.com/profile.jpg"
    },
    "commentText": "Amazing fashion show! Love the designs.",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "totalComments": 25
}
```

### 6. Get Video Comments
**GET** `/content-video/videos/:videoId/comments`

Get paginated comments for a video.

**Query Parameters:**
- `limit` (optional): Number of comments per page (default: 10)
- `page` (optional): Page number (default: 1)

**Example Request:**
```
GET /content-video/videos/video_id/comments?limit=5&page=1
```

**Response:**
```json
{
  "comments": [
    {
      "_id": "comment_id_1",
      "userId": {
        "_id": "user_id_1",
        "displayName": "User Name",
        "email": "user@example.com",
        "phoneNumber": "+1234567890",
        "profilePicture": "https://example.com/profile1.jpg"
      },
      "commentText": "Amazing fashion show! Love the designs.",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "comment_id_2",
      "userId": {
        "_id": "user_id_2",
        "displayName": "Another User",
        "email": "another@example.com",
        "phoneNumber": "+1234567891",
        "profilePicture": "https://example.com/profile2.jpg"
      },
      "commentText": "The products look fantastic!",
      "createdAt": "2024-01-15T10:25:00.000Z"
    }
  ],
  "totalComments": 25,
  "currentPage": 1,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

### 7. Update Comment
**PUT** `/content-video/videos/:videoId/comments/:commentId`

Update an existing comment (only by comment owner).

**Headers:**
```
Content-Type: application/json
Authorization: Bearer jwt_token
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "commentText": "Updated comment text here."
}
```

**Response:**
```json
{
  "message": "Comment updated successfully",
  "comment": {
    "_id": "comment_id",
    "userId": "user_id",
    "commentText": "Updated comment text here.",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### 8. Delete Comment
**DELETE** `/content-video/videos/:videoId/comments/:commentId`

Delete a comment (by comment owner or admin).

**Headers:**
```
Content-Type: application/json
Authorization: Bearer jwt_token
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "message": "Comment deleted successfully",
  "totalComments": 24
}
```

### 9. Enhanced Video Retrieval with Reactions
**GET** `/content-video/videos-with-products?userId=user_id`

Get videos with user reaction information.

**Query Parameters:**
- `userId` (optional): Include user's reaction for each video
- `limit` (optional): Number of videos per page (default: 10)
- `page` (optional): Page number (default: 1)
- `approved` (optional): Filter by approval status (default: true)

**Response:**
```json
{
  "videos": [
    {
      "_id": "video_id",
      "title": "Spring Fashion Show 2024",
      "videoUrl": "https://example.com/video.mp4",
      "no_of_likes": 15,
      "no_of_dislikes": 2,
      "no_of_Shares": 5,
      "is_approved": true,
      "createdDate": "2024-01-15T10:00:00.000Z",
      "userId": {
        "_id": "user_id",
        "displayName": "Designer Name",
        "email": "designer@example.com",
        "phoneNumber": "+1234567890",
        "profilePicture": "https://example.com/designer.jpg"
      },
      "products": [...],
      "comments": [
        {
          "_id": "comment_id",
          "userId": {
            "_id": "commenter_id",
            "displayName": "Commenter Name",
            "email": "commenter@example.com",
            "phoneNumber": "+1234567891",
            "profilePicture": "https://example.com/commenter.jpg"
          },
          "commentText": "Great video!",
          "createdAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "userReaction": "like"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalVideos": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Business Logic

### Reaction Rules
1. **Single Reaction**: Users can only have one reaction (like OR dislike) at a time
2. **Toggle Behavior**: Clicking the same reaction removes it
3. **Opposite Reaction**: Adding a new reaction removes the opposite one
4. **Count Tracking**: Like and dislike counts are maintained separately

### Comment Rules
1. **Ownership**: Users can only edit/delete their own comments
2. **Admin Rights**: Admins can delete any comment
3. **Pagination**: Comments are paginated for performance
4. **Sorting**: Comments are sorted by creation date (newest first)
5. **Real-time Updates**: Comment counts update immediately

## Usage Examples

### Mobile App Integration

#### React Native Example
```javascript
// Toggle video reaction
const toggleVideoReaction = async (videoId, userId, reactionType) => {
  try {
    const response = await fetch(`${API_BASE_URL}/content-video/videos/${videoId}/reaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ userId, reactionType }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error toggling reaction:', error);
    throw error;
  }
};

// Add comment
const addComment = async (videoId, userId, commentText) => {
  try {
    const response = await fetch(`${API_BASE_URL}/content-video/videos/${videoId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ userId, commentText }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Get comments with pagination
const getVideoComments = async (videoId, limit = 10, page = 1) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/content-video/videos/${videoId}/comments?limit=${limit}&page=${page}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};
```

#### Flutter Example
```dart
// Toggle video reaction
Future<Map<String, dynamic>> toggleVideoReaction(String videoId, String userId, String reactionType) async {
  try {
    final response = await http.post(
      Uri.parse('$API_BASE_URL/content-video/videos/$videoId/reaction'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $accessToken',
      },
      body: json.encode({
        'userId': userId,
        'reactionType': reactionType,
      }),
    );

    return json.decode(response.body);
  } catch (e) {
    throw Exception('Error toggling reaction: $e');
  }
}

// Add comment
Future<Map<String, dynamic>> addComment(String videoId, String userId, String commentText) async {
  try {
    final response = await http.post(
      Uri.parse('$API_BASE_URL/content-video/videos/$videoId/comments'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $accessToken',
      },
      body: json.encode({
        'userId': userId,
        'commentText': commentText,
      }),
    );

    return json.decode(response.body);
  } catch (e) {
    throw Exception('Error adding comment: $e');
  }
}

// Get comments with pagination
Future<Map<String, dynamic>> getVideoComments(String videoId, {int limit = 10, int page = 1}) async {
  try {
    final response = await http.get(
      Uri.parse('$API_BASE_URL/content-video/videos/$videoId/comments?limit=$limit&page=$page'),
      headers: {'Authorization': 'Bearer $accessToken'},
    );

    return json.decode(response.body);
  } catch (e) {
    throw Exception('Error fetching comments: $e');
  }
}
```

## Complete Usage Example

### Video Interaction Flow
```javascript
// Example: Complete video interaction flow
const interactWithVideo = async () => {
  try {
    const videoId = "video_id_123";
    const userId = "user_id_456";

    // Step 1: Like the video
    const likeResult = await toggleVideoReaction(videoId, userId, 'like');
    console.log("Video liked:", likeResult.message);

    // Step 2: Add a comment
    const commentResult = await addComment(videoId, userId, "Great video! Love the products.");
    console.log("Comment added:", commentResult.message);

    // Step 3: Get comments
    const commentsResult = await getVideoComments(videoId, 5, 1);
    console.log("Comments:", commentsResult.comments.length);

    // Step 4: Change reaction to dislike
    const dislikeResult = await toggleVideoReaction(videoId, userId, 'dislike');
    console.log("Video disliked:", dislikeResult.message);

    // Step 5: Get user reaction
    const reactionResult = await getUserReaction(videoId, userId);
    console.log("Current reaction:", reactionResult.userReaction);

    return {
      likeResult,
      commentResult,
      commentsResult,
      dislikeResult,
      reactionResult
    };
  } catch (error) {
    console.error("Error in video interaction:", error);
    throw error;
  }
};
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Video ID, User ID, and reaction type (like/dislike) are required."
}
```

### 401 Unauthorized
```json
{
  "message": "Access denied. Authentication required."
}
```

### 403 Forbidden
```json
{
  "message": "You can only update your own comments."
}
```

### 404 Not Found
```json
{
  "message": "Video not found."
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal Server Error",
  "error": "Error details"
}
```

## Performance Considerations

### Database Optimization
- Indexes on `likedBy` and `dislikedBy` arrays for efficient queries
- Indexes on `comments.createdAt` for sorting
- Pagination for comments to handle large datasets
- Lean queries for read operations

### Caching Strategy
- Cache user reactions for frequently accessed videos
- Cache comment counts and reaction counts
- Implement Redis caching for popular videos

## Security Considerations

### Access Control
- JWT token validation for all endpoints
- User ownership validation for comment operations
- Admin role validation for comment deletion

### Data Validation
- Input sanitization for comment text
- Reaction type validation
- User ID validation

## Testing

### Test Cases
1. **Reaction Toggle**: Test like/dislike toggle functionality
2. **Opposite Reactions**: Test removing opposite reaction when adding new one
3. **Comment CRUD**: Test comment creation, reading, updating, and deletion
4. **Pagination**: Test comment pagination
5. **Authorization**: Test access control for different user roles
6. **Edge Cases**: Test with invalid IDs, empty comments, etc.

### Test Data
```javascript
// Sample test data
const testVideo = {
  _id: 'video_id_1',
  title: 'Test Video',
  videoUrl: 'https://example.com/test.mp4',
  no_of_likes: 0,
  no_of_dislikes: 0,
  likedBy: [],
  dislikedBy: [],
  comments: []
};

const testUser = {
  _id: 'user_id_1',
  displayName: 'Test User',
  email: 'test@example.com'
};
```

## Migration Guide

### Database Migration
If you have existing videos without reaction/comment fields:

```javascript
// Migration script
const migrateVideoReactions = async () => {
  const videos = await ContentVideo.find({
    $or: [
      { no_of_dislikes: { $exists: false } },
      { dislikedBy: { $exists: false } }
    ]
  });
  
  for (const video of videos) {
    if (!video.no_of_dislikes) video.no_of_dislikes = 0;
    if (!video.dislikedBy) video.dislikedBy = [];
    await video.save();
  }
  
  console.log(`Migrated ${videos.length} videos`);
};
```

## Support

For issues and questions:
1. Check API documentation
2. Review error logs
3. Test with sample data
4. Contact development team
