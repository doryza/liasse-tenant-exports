(function(){
  var form=document.getElementById('invoiceSettingsForm');if(!form)return;
  var fields=document.getElementById('invoiceSettingsFields'),status=document.getElementById('invoiceSettingsStatus');
  function values(){var data={};form.querySelectorAll('[data-invoice-key]').forEach(function(input){data[input.dataset.invoiceKey]=input.type==='checkbox'?input.checked:input.value;});return data;}
  async function request(preview){
    if(!form.reportValidity())return;
    var body={settings:values(),sandbox:document.getElementById('previewInvoiceSandbox').checked};
    fields.disabled=true;status.classList.remove('invoice-error');status.textContent=preview?'Préparation de l’aperçu…':'Enregistrement…';
    try{
      var response=await fetch('api/admin/invoice-settings'+(preview?'/preview':''),{method:preview?'POST':'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      var result=await response.json();if(!response.ok)throw Error(result.error||'Impossible de traiter les réglages.');
      if(preview){
        document.getElementById('invoicePreviewSubject').textContent=result.subject;
        document.getElementById('invoicePreviewAttachment').textContent=result.hasAttachment?'Pièce jointe : facture PDF.':'Aucune pièce jointe.';
        document.getElementById('invoicePreviewFrame').srcdoc=result.html;
        document.getElementById('invoiceEmailPreview').hidden=false;status.textContent='Aperçu prêt. Aucun courriel envoyé.';
      }else status.textContent='Réglages de facturation enregistrés.';
    }catch(error){status.classList.add('invoice-error');status.textContent=error.message;}
    finally{fields.disabled=false;}
  }
  form.addEventListener('submit',function(event){event.preventDefault();request(false);});
  document.getElementById('previewInvoiceEmail').addEventListener('click',function(){request(true);});
})();
