import { useState, useEffect } from 'react';
import Image from 'next/image';

const ProfileForm = ({ user, onSave, userType }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    personalMail: user?.personalMail || user?.email || '',
    mobile: user?.mobile || '',
    address: user?.address || '',
    social: user?.social || [],
    semester: user?.semester || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : '',
    fatherName: user?.fatherName || '',
    motherName: user?.motherName || '',
    fatherMobile: user?.fatherMobile || '',
    motherMobile: user?.motherMobile || '',
    fatherOccupation: user?.fatherOccupation || '',
    motherOccupation: user?.motherOccupation || '',
    annualIncome: user?.annualIncome || '',
    bloodGroup: user?.bloodGroup || '',
    religion: user?.religion || '',
    category: user?.category || '',
    gender: user?.gender || '',
    aadharNo: user?.aadharNo || '',
    pwd: !!user?.pwd,
    pwdPercentage: user?.pwdPercentage || '',
    pwdCertificateUrl: user?.pwdCertificateUrl || '',
    signUrl: user?.signUrl || '',
    imageUrl: user?.imageUrl || '',
    abcId: user?.abcId || ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.imageUrl || null);
  const [selectedSign, setSelectedSign] = useState(null);
  const [signPreview, setSignPreview] = useState(user?.signUrl || null);

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        personalMail: user?.personalMail || user?.email || '',
        mobile: user?.mobile || '',
        address: user?.address || '',
        semester: user?.semester || '',
        dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : '',
        fatherName: user?.fatherName || '',
        motherName: user?.motherName || '',
        fatherMobile: user?.fatherMobile || '',
        motherMobile: user?.motherMobile || '',
        fatherOccupation: user?.fatherOccupation || '',
        motherOccupation: user?.motherOccupation || '',
        annualIncome: user?.annualIncome || '',
        bloodGroup: user?.bloodGroup || '',
        religion: user?.religion || '',
        category: user?.category || '',
        gender: user?.gender || '',
        aadharNo: user?.aadharNo || '',
        pwd: !!user?.pwd,
        pwdPercentage: user?.pwdPercentage || '',
        pwdCertificateUrl: user?.pwdCertificateUrl || '',
        signUrl: user?.signUrl || '',
        imageUrl: user?.imageUrl || '',
        abcId: user?.abcId || ''
      }));
      setImagePreview(user?.imageUrl || null);
      setSignPreview(user?.signUrl || null);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialChange = (index, field, value) => {
    const updatedSocial = [...(formData.social || [])];
    if (!updatedSocial[index]) {
      updatedSocial[index] = {};
    }
    updatedSocial[index][field] = value;
    setFormData(prev => ({
      ...prev,
      social: updatedSocial
    }));
  };

  const addSocialField = () => {
    setFormData(prev => ({
      ...prev,
      social: [...(prev.social || []), { name: '', url: '' }]
    }));
  };

  const removeSocialField = (index) => {
    setFormData(prev => ({
      ...prev,
      social: prev.social.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedSign(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSubmit = new FormData();

    // Only append allowed editable fields
    const allowedKeys = [
      'firstName', 'lastName', 'dateOfBirth', 'personalMail', 'mobile', 'address',
      'fatherName', 'motherName', 'fatherMobile', 'motherMobile', 'fatherOccupation', 'motherOccupation',
      'annualIncome', 'bloodGroup', 'religion', 'category', 'gender', 'aadharNo', 'pwd', 'pwdPercentage', 'pwdCertificateUrl', 'signUrl', 'imageUrl', 'abcId', 'email', 'social'
    ];

    Object.keys(formData).forEach(key => {
      if (!allowedKeys.includes(key)) return;
      if (key === 'social') {
        dataToSubmit.append(key, JSON.stringify(formData[key] || []));
      } else {
        dataToSubmit.append(key, formData[key]);
      }
    });

    if (selectedImage) {
      dataToSubmit.append('image', selectedImage);
    }
    if (selectedSign) {
      dataToSubmit.append('sign', selectedSign);
    }

    await onSave(dataToSubmit);
    setIsEditing(false);
  };

  const socialOptions = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'website', 'other'];

  const renderField = (label, name, type = 'text', required = false, readOnly = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name] || ''}
        onChange={handleInputChange}
        disabled={!isEditing || readOnly}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing || readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        required={required && isEditing}
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-md font-medium ${isEditing
              ? 'bg-gray-500 hover:bg-gray-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Profile Image Section */}
        <div className="mb-8 text-center">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mx-auto">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {/* Signature preview and upload */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Signature</p>
            <div className="w-48 h-24 mx-auto border rounded-md overflow-hidden bg-gray-50 mb-2">
              {signPreview ? (
                <img src={signPreview} alt="Signature" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No signature</div>
              )}
            </div>
            {isEditing && (
              <label className="inline-block px-3 py-1 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600">
                Upload Signature
                <input type="file" accept="image/*" onChange={handleSignChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 md:col-span-2 mb-4">Personal Information</h2>

          {renderField('First Name', 'firstName', 'text', true)}
          {renderField('Last Name', 'lastName', 'text', true)}
          {renderField('Email', 'email', 'email', true, true)}
          {renderField('Personal Email', 'personalMail', 'email', true)}
          {renderField('Mobile', 'mobile', 'tel')}

          {userType === 'student' && (
            <>
              {renderField('Enrollment No', 'enrollmentNo', 'number', true, true)}
              {renderField('Roll No', 'rollNo', 'number', true, true)}
              {renderField('Semester', 'semester', 'number', true, true)}
              {renderField('Section', 'section', 'text', false, true)}
              {renderField('Date of Birth', 'dateOfBirth', 'date')}
              {renderField('Gender', 'gender', 'text')}
              {renderField('Program', 'program', 'text', false, true)}
              {renderField('Branch', 'branch', 'text', false, true)}
              {renderField('Father Name', 'fatherName', 'text')}
              {renderField('Mother Name', 'motherName', 'text')}
              {renderField('Father Mobile', 'fatherMobile', 'tel')}
              {renderField('Mother Mobile', 'motherMobile', 'tel')}
              {renderField('Father Occupation', 'fatherOccupation', 'text')}
              {renderField('Mother Occupation', 'motherOccupation', 'text')}
              {renderField('Annual Income', 'annualIncome', 'number')}
              {renderField('Blood Group', 'bloodGroup', 'text')}
              {renderField('Religion', 'religion', 'text')}
              {renderField('Category', 'category', 'text')}
              {renderField('Aadhar No', 'aadharNo', 'number')}
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="pwd" checked={!!formData.pwd} onChange={(e) => setFormData(prev => ({ ...prev, pwd: e.target.checked }))} disabled={!isEditing} />
                  <span>Has PWD</span>
                </label>
                {renderField('PWD %', 'pwdPercentage', 'number')}
              </div>
              {renderField('PWD Certificate URL', 'pwdCertificateUrl', 'text')}
              <div className="md:col-span-2">
                {renderField('Address', 'address', 'text')}
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderField('Is Hosteller', 'isHosteller', 'text', false, true)}
                {renderField('Hostel Alloted', 'hostelAlloted', 'text', false, true)}
                {renderField('Room No', 'roomNo', 'text', false, true)}
              </div>
              {renderField('Sign URL', 'signUrl', 'text')}
              {renderField('ABC ID', 'abcId', 'text')}
              {renderField('Date of Admission', 'dateOfAdmission', 'date', false, true)}
              {renderField('Passout Year', 'passOutYear', 'number', false, true)}
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="isScholarshipHolder" checked={!!formData.isScholarshipHolder} onChange={(e) => setFormData(prev => ({ ...prev, isScholarshipHolder: e.target.checked }))} disabled />
                  <span>Scholarship Holder</span>
                </label>
                {renderField('Scholarship Details', 'scholarshipDetails', 'text', false, true)}
              </div>
            </>
          )}

          {userType === 'admin' && (
            <>
              {renderField('College Name', 'collegeName', 'text', true, true)}
              {renderField('College Registration No', 'collegeRegistartionNo', 'text', true, true)}
              {renderField('Abbreviation', 'abbreviation', 'text', true, true)}
            </>
          )}
        </div>

        {/* Social Links */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Social Links</h2>
            {isEditing && (
              <button
                type="button"
                onClick={addSocialField}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Add Social Link
              </button>
            )}
          </div>

          {formData.social?.length > 0 ? (
            formData.social.map((social, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                {isEditing ? (
                  <>
                    <select
                      value={social.name || ''}
                      onChange={(e) => handleSocialChange(index, 'name', e.target.value)}
                      disabled={!isEditing}
                      className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                    >
                      <option value="">Select Platform</option>
                      {socialOptions.map(option => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={social.url || ''}
                      onChange={(e) => handleSocialChange(index, 'url', e.target.value)}
                      disabled={!isEditing}
                      className={`md:col-span-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                    />
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeSocialField(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md"
                      >
                        Remove
                      </button>
                    )}
                  </>
                ) : (
                  <div className="mb-2">
                    {social.url ? (
                      <a href={social.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {social.name ? social.name.charAt(0).toUpperCase() + social.name.slice(1) : 'Link'}
                      </a>
                    ) : (
                      <span className="text-gray-700">{social.name || 'Link'}</span>
                    )}
                    {social.url && <span className="ml-2 text-gray-500">{social.url}</span>}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No social links</p>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;