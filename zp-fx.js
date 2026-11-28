/* ZurePick: feeds each pick bar its chance (e.g. "80%") as --p so CSS can draw the meter. Safe if it fails: bars just show no fill. */
(function(){
  function paint(root){
    var n=(root||document).querySelectorAll('.row .oc .pc');
    for(var i=0;i<n.length;i++){
      var el=n[i],oc=el.closest('.oc');
      if(!oc)continue;
      var v=parseFloat(el.textContent);
      if(isFinite(v)&&oc.style.getPropertyValue('--p')!==String(v))oc.style.setProperty('--p',v);
    }
  }
  var t=0;
  function later(){cancelAnimationFrame(t);t=requestAnimationFrame(function(){paint()})}
  if(document.readyState!=='loading')paint();else document.addEventListener('DOMContentLoaded',function(){paint()});
  try{new MutationObserver(later).observe(document.body||document.documentElement,{childList:true,subtree:true,characterData:true})}catch(e){}
})();
