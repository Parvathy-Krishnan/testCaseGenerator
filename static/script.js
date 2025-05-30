function showLoader() {
    document.getElementById('loader').classList.remove('hidden');
  }
  
  function copyToClipboard() {
    const text = document.getElementById('output').innerText;
    navigator.clipboard.writeText(text);
    alert("Test cases copied to clipboard!");
  }
  
  function downloadCSV() {
    const text = document.getElementById('output').innerText;
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "test_cases.csv";
    link.click();
  }
  
  function downloadExcel() {
    const text = document.getElementById('output').innerText;
    const blob = new Blob([text], { type: 'application/vnd.ms-excel' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "test_cases.xls";
    link.click();
  }
  