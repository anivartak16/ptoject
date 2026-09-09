import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import {User,Market,MarketPrice,Quality,Lot,Demand,Warehouse,LogisticsProvider,Offer,Transaction,Payment,Notification} from '../models/index.js';

const ago=days=>new Date(Date.now()-days*86400000);
const password=await bcrypt.hash('Demo@12345',12);
const demoUsers=[['Admin','admin@agrilink.com','ADMIN','Bhopal'],['Ramesh Patel','farmer@agrilink.com','FARMER','Indore'],['ABC Foods','buyer@agrilink.com','BUYER','Indore'],['Narmada FPO','fpo@agrilink.com','FPO','Ujjain']];
await mongoose.connect(process.env.MONGO_URI);
const users={};
for(const [name,email,role,location] of demoUsers)users[role]=await User.findOneAndUpdate({email},{$set:{name,email,role,location,verification:'VERIFIED',active:true},$setOnInsert:{password}},{new:true,upsert:true});
const mandiCoordinates={Indore:[75.8577,22.7196],Dewas:[76.0534,22.9676],Ujjain:[75.7885,23.1765],Bhopal:[77.4126,23.2599],Mandsaur:[75.0693,24.0734],Neemuch:[74.872,24.4764]};
if(await Market.countDocuments()===0)await Market.insertMany(Object.entries(mandiCoordinates).map(([location,coordinates])=>({name:`${location} Mandi`,location,district:location,state:'Madhya Pradesh',commodities:['Wheat','Soybean','Onion'],geo:{type:'Point',coordinates}})));
for(const [location,coordinates] of Object.entries(mandiCoordinates))await Market.updateOne({location},{$set:{geo:{type:'Point',coordinates}}});
const markets=await Market.find().limit(6);
if(await MarketPrice.countDocuments()===0){const prices=[];markets.forEach((market,index)=>{for(let day=0;day<30;day++)prices.push({market:market._id,commodity:'Wheat',date:ago(day),minPrice:2360+index*18-day*2,maxPrice:2540+index*18-day*2,modalPrice:2450+index*18-day*2,arrivalVolume:130+index*24})});await MarketPrice.insertMany(prices)}
if(await Quality.countDocuments()===0)await Quality.insertMany([{grade:'Grade A',moisture:11,foreignMatter:.5,damagedPercentage:1,certification:'Demo inspected'},{grade:'Grade B',moisture:13,foreignMatter:1.2,damagedPercentage:2}]);
const [qualityA,qualityB]=await Quality.find().limit(2);
if(!(await Lot.exists({owner:users.FARMER._id})))await Lot.insertMany([{owner:users.FARMER._id,commodity:'Wheat',quantity:2500,remainingQuantity:1500,expectedPrice:2450,location:'Indore',quality:qualityA._id,status:'PARTIALLY_SOLD',harvestDate:ago(10),availableUntil:ago(-20)},{owner:users.FARMER._id,commodity:'Soybean',quantity:1800,remainingQuantity:1800,expectedPrice:4200,location:'Dewas',quality:qualityA._id,status:'AVAILABLE',harvestDate:ago(7),availableUntil:ago(-15)}]);
if(!(await Lot.exists({owner:users.FPO._id})))await Lot.create({owner:users.FPO._id,ownerType:'FPO',commodity:'Wheat',quantity:5000,remainingQuantity:5000,expectedPrice:2420,location:'Ujjain',quality:(qualityB||qualityA)._id,status:'AVAILABLE',availableUntil:ago(-15)});
const lots=await Lot.find({owner:users.FARMER._id}).limit(3);
if(!(await Demand.exists({buyer:users.BUYER._id})))await Demand.insertMany([{buyer:users.BUYER._id,commodity:'Wheat',requiredQuantity:3000,requiredQuality:'Grade A',preferredLocation:'Indore',maxPrice:2600,deadline:ago(-14)},{buyer:users.BUYER._id,commodity:'Soybean',requiredQuantity:1500,requiredQuality:'Grade A',preferredLocation:'Dewas',maxPrice:4400,deadline:ago(-10)}]);
if(await Warehouse.countDocuments()===0)await Warehouse.insertMany([{name:'Indore Cold Storage',location:'Indore',availableCapacity:500,storageType:'Dry Warehouse',pricePerUnitPerDay:2.5,facilities:['CCTV','Insurance','Weighbridge']},{name:'Malwa Grain Store',location:'Dewas',availableCapacity:900,storageType:'Dry Warehouse',pricePerUnitPerDay:1.8,facilities:['Weighbridge','24-hour security']}]);
if(await LogisticsProvider.countDocuments()===0)await LogisticsProvider.insertMany([{name:'Kisan Transport',phone:'9876543210',vehicleType:'Truck',capacity:10000,serviceAreas:['Indore','Dewas','Ujjain'],pricePerKm:28},{name:'Malwa Logistics',phone:'9876500000',vehicleType:'Mini Truck',capacity:3000,serviceAreas:['Bhopal','Indore'],pricePerKm:22}]);
if(!(await Offer.exists({buyer:users.BUYER._id}))&&lots.length){const offer=await Offer.create({lot:lots[0]._id,buyer:users.BUYER._id,quantity:1000,pricePerUnit:2520,totalAmount:2520000,message:'Pickup can be arranged within two days.',validUntil:ago(-3),status:'ACCEPTED'});const trade=await Transaction.create({offer:offer._id,lot:lots[0]._id,buyer:users.BUYER._id,seller:lots[0].owner,quantity:1000,amount:2520000,status:'IN_TRANSIT',events:[{status:'CREATED',note:'Offer accepted and trade created',at:ago(2)},{status:'CONFIRMED',note:'Seller confirmed dispatch',at:ago(1)},{status:'IN_TRANSIT',note:'Pickup vehicle assigned'}]});await Payment.create({transaction:trade._id,amount:2520000,paymentMethod:'Bank Transfer',status:'PROCESSING',remarks:'Escrow release after delivery'})}
if(!(await Notification.exists({user:users.BUYER._id})))await Notification.insertMany([{user:users.FARMER._id,type:'NEW_OFFER',message:'New offer received for your Wheat lot.'},{user:users.BUYER._id,type:'LOGISTICS_UPDATED',message:'Pickup vehicle assigned for your Wheat transaction.'}]);
console.log('Demo data is ready. Use farmer@agrilink.com, buyer@agrilink.com, or fpo@agrilink.com with Demo@12345.');
await mongoose.disconnect();
