(function(){
const frame=document.getElementById('store-map');
if(!frame||!frame.dataset.address)return;
const el=document.getElementById('public-copy');const copy=el?JSON.parse(el.textContent):{};
const status=frame.querySelector('[role=status]');
let started=false,finished=false,timer;
function fail(){if(finished)return;finished=true;clearTimeout(timer);if(status)status.textContent=copy.mapUnavailable;}
function load(){
if(started)return;started=true;
if(!frame.dataset.key){fail();return;}
window.electroMapReady=function(){
try{
const geocoder=new google.maps.Geocoder();
geocoder.geocode({address:frame.dataset.address},function(results,state){
if(finished)return;
try{
if(state!=='OK'||!results||!results.length){fail();return;}
const location=results[0].geometry.location;
const canvas=document.createElement('div');canvas.style.height='100%';canvas.style.width='100%';
frame.appendChild(canvas);
const map=new google.maps.Map(canvas,{center:location,zoom:15,mapTypeControl:false,streetViewControl:false,fullscreenControl:true,gestureHandling:'cooperative'});
new google.maps.Marker({position:location,map:map,title:frame.dataset.address});
finished=true;clearTimeout(timer);const placeholder=frame.querySelector('.map-status');if(placeholder)placeholder.remove();
}catch(e){fail();}
});
}catch(e){fail();}
};
window.gm_authFailure=fail;
timer=setTimeout(fail,15000);
const script=document.createElement('script');script.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(frame.dataset.key)+'&callback=electroMapReady&language='+encodeURIComponent(frame.dataset.lang)+'&loading=async';script.async=true;script.onerror=fail;document.head.appendChild(script);
}
if('IntersectionObserver' in window){const observer=new IntersectionObserver(function(entries){if(entries.some(function(e){return e.isIntersecting;})){observer.disconnect();load();}},{rootMargin:'220px'});observer.observe(frame);}else load();
})();