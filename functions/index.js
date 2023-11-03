
const functions = require("firebase-functions");

const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const userCollection = 'users';

const cors = require("cors");


exports.avgOFreviews = functions.firestore
    .document('users/{userId}/reviews/{reviewId}')
    .onWrite(async (change, context) => {
    const userId = context.params.userId;

    // Get a reference to the user's 'reviews' subcollection
    const reviewsCollection = admin.firestore().collection(`users/${userId}/reviews`);

    // Get all the reviews for the user
    const reviewsQuerySnapshot = await reviewsCollection.get();

    // Calculate the new average based on the 'rating' field in the reviews
    const totalRating = reviewsQuerySnapshot.docs.reduce((total, doc) => {
        const rating = doc.data().rating;
        return total + rating;
    }, 0);

    const newAverage = (totalRating / reviewsQuerySnapshot.size).toFixed(2);

    // Update the 'reviewsAvg' field in the user's document
    const userDocRef = admin.firestore().collection('users').doc(userId);
    await userDocRef.update({ reviewsAvg: newAverage });

    return null;
});

