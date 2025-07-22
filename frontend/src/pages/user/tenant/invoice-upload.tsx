import React, { useState } from 'react';
import styles from '@/styles/style.module.css';
import { useUser } from '@/context/UserContext';
// import Image from 'next/image';

const InvoiceUpload = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    cellNumber: '',
    phantomWallet: '',
    rentAddress: '',
    rentAmount: '',
    leaseTerm: '',
    landlordFirstName: '',
    landlordLastName: '',
    landlordCompany: '',
  });
  // const [screenshot, setScreenshot] = useState<File | null>(null);
  // const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // const [selectedFileName, setSelectedFileName] = useState<string>('');


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setScreenshot(file);
  //     setSelectedFileName(file.name);
  //     setPreviewUrl(URL.createObjectURL(file));
  //   }
  // };

  // useEffect(() => {
  //   return () => {
  //     if (previewUrl) {
  //       URL.revokeObjectURL(previewUrl);
  //     }
  //   };
  // }, [previewUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = new FormData();
    form.append('email', user?.email ?? '');
    form.append('firstName', formData.firstName);
    form.append('lastName', formData.lastName);
    form.append('cellNumber', formData.cellNumber);
    form.append('phantomWallet', formData.phantomWallet);
    form.append('rentAddress', formData.rentAddress);
    form.append('rentAmount', formData.rentAmount);
    form.append('leaseTerm', formData.leaseTerm);
    form.append('landlordFirstName', formData.landlordFirstName);
    form.append('landlordLastName', formData.landlordLastName);
    form.append('landlordCompany', formData.landlordCompany);

    // if (screenshot) {
    //   form.append('screenshot', screenshot);
    // }

    try {
      const res = await fetch('/api/invoices/create', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        alert('Invoice submitted successfully!');
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          cellNumber: '',
          phantomWallet: '',
          rentAddress: '',
          rentAmount: '',
          leaseTerm: '',
          landlordFirstName: '',
          landlordLastName: '',
          landlordCompany: '',
        });
        // setScreenshot(null);
        // setSelectedFileName('');
        // setPreviewUrl(null);
      } else {
        alert(data.message || 'Error submitting invoice.');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong while submitting.');
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-start overflow-y-auto py-10 bg-[#0c0f1e] mt-5">
      <form className={styles.formCard} onSubmit={handleSubmit}>
        <h1 className={styles.pageTitle}>Payment Invoice Upload</h1>

        {/* Email */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input type="email" name="email" value={user?.email} className={styles.input} disabled />
        </div>

        {/* First & Last Name */}
        <div className={styles.formGroup}>
          <label className={styles.label}>First Name</label>
          <input type="text" name="firstName" placeholder="e.g. John" value={formData.firstName} onChange={handleChange} className={styles.input} required />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Last Name</label>
          <input type="text" name="lastName" placeholder="e.g. Doe" value={formData.lastName} onChange={handleChange} className={styles.input} required />
        </div>

        {/* Cell Number */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Cell Number</label>
          <input
            type="tel"
            name="cellNumber"
            pattern="[0-9]{10,15}"
            placeholder="e.g. +92-001234567"
            value={formData.cellNumber}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>

        {/* Wallet */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Phantom Wallet Address
            <span className={styles.infoIconWrapper}>
              <span className={styles.infoIcon}>i</span>
              <span className={styles.tooltip}>
                To find your Phantom wallet address, open your Phantom wallet (extension or app) and navigate to the &quot;Deposit&quot; or &quot;Receive&quot; section. You&apos;ll typically find your public address displayed, often with an option to copy it or generate a QR code.
                <br /><br />
                Here&apos;s a more detailed breakdown:
                <br /><br />
                1. Accessing the Wallet:
                <br /><br />
                Desktop Extension: Open your Phantom wallet extension in your web browser.
                <br /><br />
                Mobile App: Open the Phantom app on your mobile device.
                <br /><br />
                2. Finding the Address:
                <br /><br />
                Deposit/Receive:
                <br />
                Look for a button or section labeled &quot;Deposit,&quot; &quot;Receive,&quot; or &quot;Get Address&quot;.
                <br /><br />
                Public Address:
                <br />
                Your public address is a long string of characters that can be used to receive funds.
                <br /><br />
                Copy or QR Code:
                <br />
                You can often copy the address directly to your clipboard or generate a QR code to share.
              </span>
            </span>
          </label>
          <input type="text" name="phantomWallet" placeholder="Wallet public key" value={formData.phantomWallet} onChange={handleChange} className={styles.input} required />
        </div>

        {/* Rent Address */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Rent Address (Google Validated)</label>
          <input type="text" name="rentAddress" placeholder="Enter full rent address" value={formData.rentAddress} onChange={handleChange} className={styles.input} required />
        </div>

        {/* Amount of Rent */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Amount of Rent</label>
          <input type="number" name="rentAmount" placeholder="e.g. 1500" min="1" value={formData.rentAmount} onChange={handleChange} className={styles.input} required />
        </div>

        {/* Lease Term */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Term of Lease</label>
          <input type="text" name="leaseTerm" placeholder="e.g. 12 months" value={formData.leaseTerm} onChange={handleChange} className={styles.input} required />
        </div>

        {/* Screenshot */}
        {/*
          <label className={styles.label}>Screenshot of Rent Payment</label>
          <div className={styles.customFileWrapper}>
            <label className={styles.customFileLabel}>
              {selectedFileName ? selectedFileName : 'Choose Screenshot...'}
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className={styles.customFileInput}
              />
            </label>
          </div>
          {previewUrl && (
            <div className={styles.previewWrapper} style={{ position: 'relative', display: 'inline-block' }}>
              <Image src={previewUrl} alt="Preview" className={styles.previewImage} width={200} height={200} />
              <span
                className={styles.deleteIcon}
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFileName('');
                  setScreenshot(null);
                }}
                title="Remove"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: 'block', margin: 'auto' }}
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </span>
            </div>
          )}
        */}


        {/* Landlord Info */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Landlord First Name</label>
          <input type="text" name="landlordFirstName" placeholder="e.g. Sarah" value={formData.landlordFirstName} onChange={handleChange} className={styles.input} required />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Landlord Last Name</label>
          <input type="text" name="landlordLastName" placeholder="e.g. Smith" value={formData.landlordLastName} onChange={handleChange} className={styles.input} required />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Landlord Company</label>
          <input type="text" name="landlordCompany" placeholder="Company name if any" value={formData.landlordCompany} onChange={handleChange} className={styles.input} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <button type="submit" className={styles.button}>Upload Proof of Rent Payment</button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceUpload;