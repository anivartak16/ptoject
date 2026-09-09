import {MarketPrice,Market,Lot,Demand} from '../models/index.js';
export async function priceInsight(commodity){const rows=await MarketPrice.find({commodity}).sort({date:1}); if(!rows.length)return null;const vals=rows.map(x=>x.modalPrice), current=vals.at(-1), avg=n=>Math.round(vals.slice(-n).reduce((a,b)=>a+b,0)/Math.min(n,vals.length));const average30Days=avg(30),changePercentage=+((current-average30Days)/average30Days*100).toFixed(2),trend=changePercentage>1?'UP':changePercentage<-1?'DOWN':'STABLE';return {commodity,currentPrice:current,average7Days:avg(7),average30Days,minPrice:Math.min(...vals),maxPrice:Math.max(...vals),changePercentage,trend,lastUpdated:new Date(),history:rows};}
export async function marketsFor(commodity,origin=[75.8577,22.7196]){const prices=await MarketPrice.find({commodity}).sort({date:-1}).populate('market');const newest=new Map;prices.forEach(p=>{if(!newest.has(String(p.market._id)))newest.set(String(p.market._id),p)});const distance=([lng,lat])=>{const r=Math.PI/180,dLat=(lat-origin[1])*r,dLng=(lng-origin[0])*r,a=Math.sin(dLat/2)**2+Math.cos(origin[1]*r)*Math.cos(lat*r)*Math.sin(dLng/2)**2;return Math.round(6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)))};return [...newest.values()].map(p=>({...p.toObject(),distanceKm:distance(p.market.geo.coordinates)})).sort((a,b)=>a.distanceKm-b.distanceKm).map((row,index)=>({...row,isNearest:index===0}));}
export function sellAdvice(insight,demandCount=0){if(!insight)return null;let recommendation='COMPARE_MARKETS',reason='Compare verified nearby mandi prices before committing your produce.';if(insight.trend==='UP'&&insight.currentPrice<insight.average30Days){recommendation='WAIT';reason='Current price is below the 30-day average and the recent trend is upward.'}else if(insight.currentPrice>=insight.average30Days&&demandCount>0){recommendation='SELL_NOW';reason='Price is at or above the recent average and active buyer demand is available.'}return {recommendation,confidence:72,reason,disclaimer:'Rule-based market insight — not financial advice or guaranteed price prediction.'};}
export async function matchesFor(demand){
	if(demand.deadline&&new Date(demand.deadline)<=new Date())return [];
	const lots=await Lot.find({commodity:demand.commodity,status:{$in:['AVAILABLE','PARTIALLY_SOLD']}}).populate('quality owner');
	return lots.filter(l=>!l.availableUntil||new Date(l.availableUntil)>new Date()).map(l=>{
		const quantityScore=Math.min((l.remainingQuantity||0)/(demand.requiredQuantity||1),1)*25;
		const grade=(l.quality?.grade||'').toLowerCase()===(demand.requiredQuality||'').toLowerCase();
		const qualityScore=grade?25:12;
		const priceScore=l.expectedPrice<=demand.maxPrice?25:Math.max(0,25-((l.expectedPrice-demand.maxPrice)/Math.max(demand.maxPrice,1))*25);
		const locationMatch=!demand.preferredLocation||l.location?.toLowerCase()===demand.preferredLocation.toLowerCase();
		const locationScore=locationMatch?15:5;
		const freshnessScore=l.availableUntil?10:6;
		const matchScore=Math.round(Math.max(0,Math.min(100,quantityScore+qualityScore+priceScore+locationScore+freshnessScore)));
		const reasons=[
			`${Math.round(quantityScore)}/25 quantity fit`,
			`${Math.round(qualityScore)}/25 quality fit`,
			`${Math.round(priceScore)}/25 price fit`,
			`${Math.round(locationScore)}/15 location fit`,
			`${Math.round(freshnessScore)}/10 availability fit`,
		];
		return {lot:l,matchScore,reasons,breakdown:{quantity:Math.round(quantityScore),quality:Math.round(qualityScore),price:Math.round(priceScore),location:Math.round(locationScore),availability:Math.round(freshnessScore)}};
	}).sort((a,b)=>b.matchScore-a.matchScore);
}
