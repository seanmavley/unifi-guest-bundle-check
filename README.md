# Unifi Guest Voucher Check

Allow users of your Unifi hotspot with vouchers check how much data they have left.

This is a stripped down version of the entire 

## What

A way for my Unifi WiFi Hotspot users to check the data left on their voucher quota themselves. I'm tired of doing the maths for them every now and then.

Here's how it looks in the browser:

Voucher Stats Display
![Screenshot 1 - Voucher Stats Display](http://i.imgur.com/zcY02bb.png)

Voucher Check Form
![Screenshot 2 - Voucher Check Form](http://i.imgur.com/YKzLWiC.png)

## Why

Users of our wifi network needed a way to check the validity, data remaining and expiry of their vouchers on their own. Worked on this project to get that done.

Not interested in customers knocking my door at 2 am just to ask how much data left in their 100mb package.

## How

The Unifi Controller comes with an API. Delian, beautifully also has this project https://github.com/delian/node-unifiapi which is node-based and exposes an API for consuming Unifi Controller's API.

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
