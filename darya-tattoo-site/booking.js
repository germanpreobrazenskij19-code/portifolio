(()=>{
 const dialog=document.querySelector('#booking-dialog');if(!dialog)return;
 document.addEventListener('click',event=>{const button=event.target.closest('[data-booking]');if(!button)return;const parent=button.closest('dialog');if(parent&&parent!==dialog)parent.close();dialog.showModal()});
 dialog.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
})();
