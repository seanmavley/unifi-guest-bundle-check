# Unifi Guest Voucher Check

Allow users of your Unifi hotspot with vouchers check how much data they have left.

## What

A way for my Unifi WiFi Hotspot users to check the balance left on their voucher quota themselves. I'm tired of doing the maths for them every second.

Here's how it looks in the browser:

[Screenshot 1 - Voucher Stats Display](http://i.imgur.com/zcY02bb.png)

[Screenshot 2 - Voucher Check Form](http://i.imgur.com/YKzLWiC.png)

## Why

Ever since I started running a small neighborhood WiFi hotspot thing, the most requested feature is the ability for the users to check how much data they have left per their voucher.

Unifi happily doesn't have that feature in-built to the Unifi Controller. As to why not, is a 2,392 paged-book on its own. We'll skip that for now.

Since I couldn't be the one to always update users of the WiFi all the time with how much data they have left (which I think they have the right to know), I had to get out of the picture, and let the Users do it themselves.

## How

The Unifi Controller comes with an API. Delian, beautifully also has this project https://github.com/delian/node-unifiapi which is node-based and exposes the Unifi API for consumption.

I just query for a list of guests, the return the object with a matching voucher as the requested.

A bit of additions and or subtractions are done in the templates to present the total data quota, how much used and left.

# How to Use

This project was built with Node 7+ in mind, so make sure you have Node installed, Bower and NPM ready.

 - Download this repository
 - Create a `credentials.js` file, and modify it with content similar to as seen in the `credentials-sample.js` file.
 - Run `node bin/www` within the project directory to start the server on port `3010`
 - Open `localhost:3010/check-voucher` in your browser to see voucher interface.

The `/` (homepage) of the project above is simply something particular for the WiFi hotspot I run. Just change the routes to match whatever you want.

Check [Unifi articles on Khophi's Dev Blog](https://blog.khophi.co/tag/unifi) to read an article about this project.