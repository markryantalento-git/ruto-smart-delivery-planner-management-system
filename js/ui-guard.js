const editableTarget=target=>target instanceof Element&&target.closest('input,textarea,select,[contenteditable="true"],[data-allow-copy]');
document.addEventListener('contextmenu',event=>{if(!editableTarget(event.target))event.preventDefault()});
document.addEventListener('selectstart',event=>{if(!editableTarget(event.target))event.preventDefault()});
document.addEventListener('copy',event=>{if(!editableTarget(event.target))event.preventDefault()});
