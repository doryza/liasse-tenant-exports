(function(){
 // Liasse's SDK intercepts login-like text at document capture. These explicit
 // links use VendVite's broker identity, so keep their native navigation.
 // Stopping propagation preserves normal links, keyboard clicks and new tabs.
 window.addEventListener('click',function(event){
  var link=event.target.closest&&event.target.closest('a[data-vv-auth]');
  if(link)event.stopImmediatePropagation();
 },true);
})();
