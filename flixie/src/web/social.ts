import { list, object, person, text, type Person } from './models';
import { profilePath, titlePath } from './routing';
export interface FriendRequest { id:string;from:Person;to:Person;status:'PENDING'|'ACCEPTED'|'DECLINED';createdAt:string }
export function peopleSearch(value:unknown,ownerId:string):Person[]{
  if(!Array.isArray(value))throw new Error('People could not be loaded.');
  return [...new Map(value.map(person).filter(p=>p.id&&p.id!==ownerId).map(p=>[p.id,{...p,firstName:''}])).values()];
}
export function friendRequests(value:unknown,ownerId:string):FriendRequest[]{
  if(!Array.isArray(value))throw new Error('Friend requests could not be loaded.');
  return value.flatMap(value=>{const row=object(value);if(row.type!=='FRIEND_REQUEST')return[];const from=person(row.requester),to=person(row.recipient),status=text(row.status);
    if(!text(row.id)||!from.id||!to.id||![from.id,to.id].includes(ownerId)||!['PENDING','ACCEPTED','DECLINED'].includes(status))throw new Error('This friend request could not be loaded.');
    return[{id:text(row.id),from:{...from,firstName:''},to:{...to,firstName:''},status:status as FriendRequest['status'],createdAt:text(row.createdAt)}];});
}
export function connectionState(id:string,ownerId:string,friends:Person[],requests:FriendRequest[]){
  if(id===ownerId)return 'self';if(friends.some(p=>p.id===id))return 'friends';
  if(requests.some(r=>r.status==='PENDING'&&r.from.id===id&&r.to.id===ownerId))return 'incoming';
  if(requests.some(r=>r.status==='PENDING'&&r.to.id===id&&r.from.id===ownerId))return 'sent';return 'none';
}
export interface InboxItem { id:string;title:string;message:string;read:boolean;createdAt:string;sender:Person|null;type:string;event:string;requestId:string|null;planId:string|null;destination:{href:string;label:string;native:boolean} }
const identifier=(value:unknown)=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(value)?value:null;
export function inboxItem(value:unknown,ownerId:string):InboxItem{
  const row=object(value),data=object(row.data),request=object(object(row.link).request);
  if(!identifier(row.id)||row.userId!==ownerId)throw new Error('These notifications could not be loaded.');
  const planId=identifier(data.simplePlanId),requestId=row.type==='FRIEND_REQUEST'&&request.type==='FRIEND_REQUEST'&&[request.requesterId,request.recipientId].includes(ownerId)?identifier(request.id):null;
  const actor=person(row.senderUser??(request.requesterId===ownerId?request.recipient:request.requester));
  let destination:InboxItem['destination']={href:'/download',label:'Open in Flixie',native:true};
  if(planId)destination={href:`/app/plans?plan=${encodeURIComponent(planId)}`,label:'View Watch Plan',native:false};
  else if(row.type==='FRIEND_REQUEST')destination={href:'/app/friends',label:requestId&&request.status==='PENDING'?'View friend request':'View friends',native:false};
  else if(['AVAILABILITY_ALERT','MOVIE_RATING','SHOW_RATING'].includes(text(row.type))){const movie=Number(data.movieId),show=Number(data.showId);if(Number.isSafeInteger(movie)&&movie>0)destination={href:titlePath(movie),label:'View film',native:false};else if(Number.isSafeInteger(show)&&show>0)destination={href:titlePath(show,'show'),label:'View show',native:false};}
  else if(row.type==='REFERRAL_JOINED'&&actor.id)destination={href:profilePath(actor.id),label:'View profile',native:false};
  const message=data.containsSpoilers===true?'This activity contains spoilers. Open it in Flixie to view it.':text(row.message);
  return {id:text(row.id),title:text(row.title)||({FRIEND_REQUEST:'Friend request',MOVIE_WATCH_REQUEST:'Watch Plan update',AVAILABILITY_ALERT:'Viewing update'} as Record<string,string>)[text(row.type)]||'Flixie activity',message:message|| (row.type==='FRIEND_REQUEST'?`${actor.username||'Someone'} ${request.status==='ACCEPTED'?'accepted a friend request':request.status==='DECLINED'?'declined a friend request':'sent a friend request'}.`:'There’s an update in Flixie.'),read:row.read===true,createdAt:text(row.notificationReceived,text(row.createdAt)),sender:actor.id?{...actor,firstName:''}:null,type:text(row.type),event:text(row.event,text(data.event)),requestId,planId,destination};
}
export function inboxPage(value:unknown,ownerId:string){
  const row=object(value);if(!Array.isArray(row.items)||!Number.isSafeInteger(row.unreadCount)||Number(row.unreadCount)<0)throw new Error('Your notification inbox could not be loaded.');
  return {items:row.items.filter(value=>object(value).closed!==true).map(value=>inboxItem(value,ownerId)),nextCursor:text(row.nextCursor)||null,unreadCount:Number(row.unreadCount)};
}
