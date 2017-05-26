const express = require('express');
const config = require('../lib/config');
const api = require('../lib/api');
const request = require('request');
const router = express.Router();

/**
 * Description : Story Specific Routes ~ prefix /story/endpoint
 */
const newStory = (id = 1) => ({
     id,
     owner_id: "Bkq1gr2N05OV",
     curator_id: "Bkq1gr2N05OV",
     assignment_id: "wOo1PZ9j8Kvl",
     outlet_id: "Z6rg1Vw3Mjkz",
     owner: {
         avatar: null,
         bio: "",
         blocked: false,
         blocking: false,
         created_at: "2017-03-30T21:09:40.944Z",
         disabled: false,
         followed_count: 2,
         following: false,
         following_count: 4,
         full_name: "Revanth",
         id: "Bkq1gr2z05OV",
         location: "",
         object: "user",
         photo_count: 1,
         rating: 0,
         submission_count: 2,
         suspended_until: null,
         trusted: null,
         twitter_handle: null,
         username: "revanth",
         video_count: 1,
     },
     title: "Piet Mondrian raises from the dead",
     caption: "Now present at the MoMA in new performance piece",
     tags: ["cucu", "freedom", "piet mondrian", "red", "white", "blue"],
     rating: 1,
     created_at: "2017-05-10T21:46:51.000Z",
     highlighted_at: "2017-05-10T21:46:51.000Z",
     posts: [
         {
             address: "9 S William St, New York, NY",
             assignment_id: "rYd0yDEW8Dp5",
             captured_at: "2017-05-15T16:20:06.000Z",
             created_at: "2017-05-15T16:20:36.507Z",
             curator_id: null,
             duration: null,
             exclusive_to: null,
             exclusive_until: null,
             height: 3024,
             id: "nEZ1lapQ73Lg",
             image: "http://www.piet-mondrian.org/images/paintings/composition-c.jpg",
             is_nsfw: false,
             license: 0,
             location: {
                 coordinates: [ -74.0110538, 40.7038987 ],
                 type: "point"
             },
             object: "post",
             outlet_id: null,
             owner: {
                 avatar: null,
                 bio: "",
                 blocked: false,
                 blocking: false,
                 created_at: "2017-03-30T21:09:40.944Z",
                 disabled: false,
                 followed_count: 2,
                 following: false,
                 following_count: 4,
                 full_name: "Revanth",
                 id: "Bkq1gr2z05OV",
                 location: "",
                 object: "user",
                 photo_count: 1,
                 rating: 0,
                 submission_count: 2,
                 suspended_until: null,
                 trusted: null,
                 twitter_handle: null,
                 username: "revanth",
                 video_count: 1,
             },
             owner_id: "Bkq1gr2z05OV",
             parent: {},
             parent_id: "xYV1RPxJd8Re",
             purchased: false,
             rating: 2,
             status: 2,
             stream: null,
             updated_at: "2017-05-15T16:24:20.008Z",
             video: null,
             width: 4032,
         },
         {
             address: "9 S William St, New York, NY",
             assignment_id: "rYd0yDEW8Dp5",
             captured_at: "2017-05-15T16:20:06.000Z",
             created_at: "2017-05-15T16:20:36.507Z",
             curator_id: null,
             duration: null,
             exclusive_to: null,
             exclusive_until: null,
             height: 3024,
             id: "nEZ1lapQ73Lg",
             image: "http://www.piet-mondrian.org/images/paintings/composition-c.jpg",
             is_nsfw: false,
             license: 0,
             location: {
                 coordinates: [ -74.0110538, 40.7038987 ],
                 type: "point"
             },
             object: "post",
             outlet_id: null,
             owner: {
                 avatar: null,
                 bio: "",
                 blocked: false,
                 blocking: false,
                 created_at: "2017-03-30T21:09:40.944Z",
                 disabled: false,
                 followed_count: 2,
                 following: false,
                 following_count: 4,
                 full_name: "Revanth",
                 id: "Bkq1gr2z05OV",
                 location: "",
                 object: "user",
                 photo_count: 1,
                 rating: 0,
                 submission_count: 2,
                 suspended_until: null,
                 trusted: null,
                 twitter_handle: null,
                 username: "revanth",
                 video_count: 1,
             },
             owner_id: "Bkq1gr2z05OV",
             parent: {},
             parent_id: "xYV1RPxJd8Re",
             purchased: false,
             rating: 2,
             status: 2,
             stream: null,
             updated_at: "2017-05-15T16:24:20.008Z",
             video: null,
             width: 4032,
         },
         {
             address: "9 S William St, New York, NY",
             assignment_id: "rYd0yDEW8Dp5",
             captured_at: "2017-05-15T16:20:06.000Z",
             created_at: "2017-05-15T16:20:36.507Z",
             curator_id: null,
             duration: null,
             exclusive_to: null,
             exclusive_until: null,
             height: 3024,
             id: "nEZ1lapQ73Lg",
             image: "http://www.piet-mondrian.org/images/paintings/composition-c.jpg",
             is_nsfw: false,
             license: 0,
             location: {
                 coordinates: [ -74.0110538, 40.7038987 ],
                 type: "point"
             },
             object: "post",
             outlet_id: null,
             owner: {
                 avatar: null,
                 bio: "",
                 blocked: false,
                 blocking: false,
                 created_at: "2017-03-30T21:09:40.944Z",
                 disabled: false,
                 followed_count: 2,
                 following: false,
                 following_count: 4,
                 full_name: "Revanth",
                 id: "Bkq1gr2z05OV",
                 location: "",
                 object: "user",
                 photo_count: 1,
                 rating: 0,
                 submission_count: 2,
                 suspended_until: null,
                 trusted: null,
                 twitter_handle: null,
                 username: "revanth",
                 video_count: 1,
             },
             owner_id: "Bkq1gr2z05OV",
             parent: {},
             parent_id: "xYV1RPxJd8Re",
             purchased: false,
             rating: 2,
             status: 2,
             stream: null,
             updated_at: "2017-05-15T16:24:20.008Z",
             video: null,
             width: 4032,
         },
         {
             address: "9 S William St, New York, NY",
             assignment_id: "rYd0yDEW8Dp5",
             captured_at: "2017-05-15T16:20:06.000Z",
             created_at: "2017-05-15T16:20:36.507Z",
             curator_id: null,
             duration: null,
             exclusive_to: null,
             exclusive_until: null,
             height: 3024,
             id: "nEZ1lapQ73Lg",
             image: "http://www.piet-mondrian.org/images/paintings/composition-c.jpg",
             is_nsfw: false,
             license: 0,
             location: {
                 coordinates: [ -74.0110538, 40.7038987 ],
                 type: "point"
             },
             object: "post",
             outlet_id: null,
             owner: {
                 avatar: null,
                 bio: "",
                 blocked: false,
                 blocking: false,
                 created_at: "2017-03-30T21:09:40.944Z",
                 disabled: false,
                 followed_count: 2,
                 following: false,
                 following_count: 4,
                 full_name: "Revanth",
                 id: "Bkq1gr2z05OV",
                 location: "",
                 object: "user",
                 photo_count: 1,
                 rating: 0,
                 submission_count: 2,
                 suspended_until: null,
                 trusted: null,
                 twitter_handle: null,
                 username: "revanth",
                 video_count: 1,
             },
             owner_id: "Bkq1gr2z05OV",
             parent: {},
             parent_id: "xYV1RPxJd8Re",
             purchased: false,
             rating: 2,
             status: 2,
             stream: null,
             updated_at: "2017-05-15T16:24:20.008Z",
             video: null,
             width: 4032,
         },
         {
             address: "9 S William St, New York, NY",
             assignment_id: "rYd0yDEW8Dp5",
             captured_at: "2017-05-15T16:20:06.000Z",
             created_at: "2017-05-15T16:20:36.507Z",
             curator_id: null,
             duration: null,
             exclusive_to: null,
             exclusive_until: null,
             height: 3024,
             id: "nEZ1lapQ73Lg",
             image: "http://www.piet-mondrian.org/images/paintings/composition-c.jpg",
             is_nsfw: false,
             license: 0,
             location: {
                 coordinates: [ -74.0110538, 40.7038987 ],
                 type: "point"
             },
             object: "post",
             outlet_id: null,
             owner: {
                 avatar: null,
                 bio: "",
                 blocked: false,
                 blocking: false,
                 created_at: "2017-03-30T21:09:40.944Z",
                 disabled: false,
                 followed_count: 2,
                 following: false,
                 following_count: 4,
                 full_name: "Revanth",
                 id: "Bkq1gr2z05OV",
                 location: "",
                 object: "user",
                 photo_count: 1,
                 rating: 0,
                 submission_count: 2,
                 suspended_until: null,
                 trusted: null,
                 twitter_handle: null,
                 username: "revanth",
                 video_count: 1,
             },
             owner_id: "Bkq1gr2z05OV",
             parent: {},
             parent_id: "xYV1RPxJd8Re",
             purchased: false,
             rating: 2,
             status: 2,
             stream: null,
             updated_at: "2017-05-15T16:24:20.008Z",
             video: null,
             width: 4032,
         },
         {
             address: "9 S William St, New York, NY",
             assignment_id: "rYd0yDEW8Dp5",
             captured_at: "2017-05-15T16:20:06.000Z",
             created_at: "2017-05-15T16:20:36.507Z",
             curator_id: null,
             duration: null,
             exclusive_to: null,
             exclusive_until: null,
             height: 3024,
             id: "nEZ1lapQ73Lg",
             image: "http://www.piet-mondrian.org/images/paintings/composition-c.jpg",
             is_nsfw: false,
             license: 0,
             location: {
                 coordinates: [ -74.0110538, 40.7038987 ],
                 type: "point"
             },
             object: "post",
             outlet_id: null,
             owner: {
                 avatar: null,
                 bio: "",
                 blocked: false,
                 blocking: false,
                 created_at: "2017-03-30T21:09:40.944Z",
                 disabled: false,
                 followed_count: 2,
                 following: false,
                 following_count: 4,
                 full_name: "Revanth",
                 id: "Bkq1gr2z05OV",
                 location: "",
                 object: "user",
                 photo_count: 1,
                 rating: 0,
                 submission_count: 2,
                 suspended_until: null,
                 trusted: null,
                 twitter_handle: null,
                 username: "revanth",
                 video_count: 1,
             },
             owner_id: "Bkq1gr2z05OV",
             parent: {},
             parent_id: "xYV1RPxJd8Re",
             purchased: false,
             rating: 2,
             status: 2,
             stream: null,
             updated_at: "2017-05-15T16:24:20.008Z",
             video: null,
             width: 4032,
         }
     ]
 })

router.get('/:id', (req, res, next) => {
    api.request({
        token: req.session.token.token,
        url: '/story/' + req.params.id,
    }).then(response => {
        const props = {
            story: newStory(),
            user: req.session.user
        };
        res.render('app', {
            props: JSON.stringify(props),
            config: config,
            alerts: req.alerts,
            referral: req.session.referral,
            page: 'storyDetail',
            title : 'Story'
        });
    }).catch( () => {
        const props = {
            story: newStory(),
            user: req.session.user
        };
        res.render('app', {
            props: JSON.stringify(props),
            config: config,
            alerts: req.alerts,
            referral: req.session.referral,
            page: 'storyDetail',
            title : 'Story'
        });
    })
});

module.exports = router;
