import React, { useState } from 'react';
import TextAreaWithLineNumber from 'text-area-with-line-number';


function MergeComponents() {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [addressValueMap, setAddressValueMap] = useState(new Map());
  const [hasDuplicates, setHasDuplicates] = useState(false);
  const [btnColor,setbtnColor]=useState('#0D6EFD')

  const handleInputChange = (e) => {
    
    setbtnColor('#0D6EFD')
    setInputText(e.target.value);
    setError(null);
    setResult(null);
    setAddressValueMap(new Map());
    setHasDuplicates(false); 
  };

  const validateInput = () => {
    const lines = inputText.split('\n').filter((line) => line.trim() !== '');
    const newAddressValueMap = new Map();
    const errors = [];
    const validAddresses = [];
    const duplicateAddresses = new Map();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const parts = line.split(/[=, ]+/); 

      if (parts.length === 2) {
        const [address, value] = parts;

        if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
          errors.push(`Line ${i + 1}: Invalid Entered address: ${address}`);
        } else if (!/^\d+$/.test(value)) {
          errors.push(` Line ${i + 1} wrong amount`);
        } else {
          const intValue = parseInt(value, 10);
          if (newAddressValueMap.has(address)) {
            if (!duplicateAddresses.has(address)) {
              duplicateAddresses.set(address, [newAddressValueMap.get(address)]);
            }
            duplicateAddresses.get(address).push(i + 1);
          } else {
            newAddressValueMap.set(address, intValue);
            validAddresses.push({ address, amount: intValue });
          }
        }
      } else {
        errors.push(`Line ${i + 1}: Incorrect format: ${line}`);
      }
    }

    duplicateAddresses.forEach((lines, address) => {
      errors.push(`Address ${address} encountered duplicate in Line: ${lines.join(', ')}`);
    });

    if (errors.length > 0) {
      setError(errors.join('\n\n'));
      setResult(null);
      setbtnColor('#0D6EFD')
      setAddressValueMap(new Map());
      setHasDuplicates(true); 
    } else {
      setError(null);
      setResult(validAddresses);
      setbtnColor('#820ED8')
      setAddressValueMap(newAddressValueMap);
      setHasDuplicates(false); 
    }
  };

  const keepFirstOne = () => {
    const lines = inputText.split('\n').filter((line) => line.trim() !== '');
    const newLines = [];
    const seenAddresses = new Set();

    for (const line of lines) {
      const [address] = line.split(/[=, ]+/);

      if (!seenAddresses.has(address)) {
        newLines.push(line);
        seenAddresses.add(address);
      }
    }

    setInputText(newLines.join('\n'));
    setHasDuplicates(false); 
  };

  const combineBalance = () => {
    const lines = inputText.split('\n').filter((line) => line.trim() !== '');
    const newAddressValueMap = new Map();

    for (const line of lines) {
      const [address, value] = line.split(/[=, ]+/);

      if (!newAddressValueMap.has(address)) {
        newAddressValueMap.set(address, 0);
      }

      newAddressValueMap.set(address, newAddressValueMap.get(address) + parseInt(value, 10));
    }

    const newLines = Array.from(newAddressValueMap.entries()).map(([address, value]) => `${address}=${value}`);

    setInputText(newLines.join('\n'));
    setHasDuplicates(false);
  };

  return (
    <div className="container" style={{ width: '60vw' }}>
      <h4 className="mt-3" style={{ textAlign: 'left' }}></h4>
      <div className="mb-3" style={{ textAlign: 'left', color: 'grey', fontSize: '0.8rem', fontWeight: '500' }}>
        <p> Addresses with Amounts </p>
        <TextAreaWithLineNumber
          className="form-control"
          style={{ background: '#f5f5fa' }}
          rows="9"
          value={inputText}
          onChange={handleInputChange}
          border='2px solid #d3d3d9'
        />
        <p style={{ textAlign: 'left', color: 'grey', fontSize: '0.8rem', fontWeight: '500' }}>
          Separate by ',' or '='
        </p>
      </div>

      {/* Conditionally render the "Keep the first one" and "Combine Balance" buttons */}
      {hasDuplicates && (
        <div className="row">
          <div className="col text-left" style={{ color: "red", textAlign: "left" }}>
            Duplicate
          </div>
          <div className="col text-right" style={{ color: "red", textAlign: "right" }}>
            <span className="" onClick={keepFirstOne} style={{cursor:'pointer'}}>
              Keep the first one |{'  '}
            </span>
            <span className="" onClick={combineBalance} style={{cursor:'pointer'}}>
                Combine Balance
            </span>
          </div>
        </div>
      )}

      {hasDuplicates && error && (
        // main parent
        <div className="alert border border-danger mt-2" style={{color:"red",display:'flex'}} role="alert">
           <div style={{ alignItems: 'center',marginRight:'10px'}}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        style={{ fill: '#ff0000' }}
      >
        <path d="M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.493 2 11.953 2zM12 20c-4.411 0-8-3.589-8-8s3.567-8 7.953-8C16.391 4 20 7.589 20 12s-3.589 8-8 8z" />
        <path d="M11 7h2v7h-2zm0 8h2v2h-2z" />
      </svg>
    </div>
    <div>
          {error.split('\n\n').map((errorMessage, index) => (
            <div className='color-dander' key={index}>
              {errorMessage}
            </div>
          ))}
          
      </div>
        </div>
        // end main parent
      )}
      <button className="btn mt-3 w-100" style={{color: "white",backgroundColor: `${btnColor}` }} onClick={validateInput}>
        Next
      </button>

      {result && (
        <div className="result mt-3" style={{textAlign:"left"}}>
          <h5>Address:</h5>
          <ul style={{ listStyleType: 'none', textAlign:"left"}}>
            {Array.from(addressValueMap.keys()).map((address) => (
              <li key={address}>
                {address}
              </li>
            ))}
          </ul>
        </div>
      )}

      
      {/* <TextAreaWithLineNumber value={edit} onChange={(e)=>setedit(e.target.value)} /> */}
     
    </div>
  );
}

export default MergeComponents;