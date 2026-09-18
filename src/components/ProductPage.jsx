import React, { useEffect, useState } from 'react';
import { AudioCheck } from './AudioCheck';
import successSound from '../../src/success.wav';
import { ProductStyleImages } from 'react-product-style-images';
// import successSound from "/puppy.wav";
const ProductPage = ({ data }) => {
  const [loading, setLoading] = useState(true);
  const [styleId, setStyleId] = useState('');
  const [error, setError] = useState(null);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const loadedVoices = window.speechSynthesis.getVoices();
      setVoices(loadedVoices);
      console.log('Voices loaded:', loadedVoices.length);

      // अगर voices available हैं, तो automatically speak करें
      if (loadedVoices.length > 0 && data?.[0]?.orders_2?.style_number) {
        // Auto-speak when voices are ready (optional)
        // speakInfo();
      }
    };

    // Initial load
    loadVoices();

    // Some browsers need this event
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Cleanup
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, [data]);

  const speakInfo = () => {
    if (!data?.[0]?.orders_2?.style_number) return;

    window.speechSynthesis.cancel();

    const styleNo = data[0].orders_2.style_number;
    const employeeName = data[0]?.employees?.user_name?.split(' / ')[0] || 'अज्ञात';

    const text = `Style नंबर ${styleNo} के लिए कर्मचारी ${employeeName} है।`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8; // Speed slow करें
    utterance.pitch = 1;
    utterance.volume = 1;

    // Better voice selection
    const availableVoices = window.speechSynthesis.getVoices();
    console.log('Available voices:', availableVoices); // Debug के लिए

    // Hindi voice ढूंढें
    const hindiVoice = availableVoices.find(
      (v) =>
        v.lang.includes('hi') || v.lang.includes('IN') || v.name.toLowerCase().includes('hindi')
    );

    if (hindiVoice) {
      utterance.voice = hindiVoice;
      console.log('Using Hindi voice:', hindiVoice.name);
    } else {
      console.log('No Hindi voice found, using default');
    }

    // Event listeners add करें
    utterance.onstart = () => console.log('Speech started');
    utterance.onend = () => console.log('Speech ended');
    utterance.onerror = (event) => console.error('Speech error:', event);

    window.speechSynthesis.speak(utterance);
    console.log('Speaking text:', text);
  };

  speakInfo();
  const playSound = () => {
    const audio = new Audio(successSound);
    audio.play();
    console.log('Sound play');
  };

  useEffect(() => {
    playSound();
  }, [data[0]?.orders_2?.style_number]);

  const employeeImages = {
    sudhan: 'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770361766/sudhan_k5no1a.jpg',
    aslam: 'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770288946/aslam_tqme8r.webp',
    nurul: 'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770361765/nurul_fbkhoi.jpg',
    'sah mohammad miyan':
      'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770288949/shan_xv4zcx.webp',
    'vikash kumar':
      'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770361769/vikas_n4kwta.jpg',
    'rizwan mohammad':
      'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770361766/rizwan_iipcjq.jpg',
    'subhash cutting master':
      'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770361767/subhash_tfhx6k.jpg',
    shailendar:
      'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770361766/shailendar_mdmwqq.jpg',
    mukhtar: 'https://res.cloudinary.com/der6k8zbm/image/upload/v1764168202/mukhtar_dqciu4.jpg',
    mahesh: 'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770288948/mahesh_jr3e2j.webp',
    'naimuddin ansari':
      'https://res.cloudinary.com/der6k8zbm/image/upload/v1764168199/niamuddin_iyhh8r.jpg',
    ranjeet: 'https://res.cloudinary.com/der6k8zbm/image/upload/v1764168199/niamuddin_iyhh8r.jpg',
    'mobarak miyo':
      'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770361770/mubarak_kg8i4f.jpg',
    khurshid: 'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770288947/khurshid_sosa9x.webp',
    nasim: 'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770448904/nasim_jqrqzx_fq1djl.jpg',
    qamaruddn:
      'https://res.cloudinary.com/der6k8zbm/image/upload/v1764168200/qamaruddin_x2htlc.jpg',
    dilshad: 'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770361764/dilshad_cuyrgt.jpg',
    surendra: 'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770361767/surendar_teupip.jpg',
    samsul: 'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770361765/samsul_frnxp0.jpg',
    inamul: 'https://res.cloudinary.com/der6k8zbm/image/upload/v1764168201/inamul_atsm3g.jpg',
    rampreet: 'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770361770/rampreet_bnyrbx.jpg',
    'idrees miyan':
      'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770361766/idrish_k0i3zd.jpg',
    pooja: 'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770288947/pooja_b17nmm.webp',
    'manish kumar':
      'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1789721253/manish_kumar_watrsb.jpg',
    'raju pressman':
      'https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770288948/raju_yww9tv.webp',
  };

  console.log(
    'incoming user ',
    employeeImages[data[0]?.employees?.user_name?.toLowerCase()?.split(' / ')[0]]
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-1 px-2">
      <div className="container mx-auto">
        {/* <AudioCheck /> */}

        <div className="flex gap-4 mb-6">
          {/* <SpeakButton /> */}
          <StatusIndicator loading={loading} hasData={!!styleId} error={error} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            {/* Employee Image Card */}
            <div className="bg-gray-800 rounded-2xl  border border-gray-700">
              <div className="relative group">
                <img
                  className="w-full h-[900px]  rounded-xl shadow-lg border-2 border-blue-500 transition-all duration-300 "
                  src={`${employeeImages[data[0]?.employees?.user_name?.toLowerCase()?.split(' / ')[0]]}`}
                  loading="lazy"
                  // src={`${employeeImages['subhash cutting master']}`}
                  //   src="https://res.cloudinary.com/dlqbbwdc5/image/upload/v1770288950/vishal_p44gy4.webp"
                />
                <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
              </div>
            </div>
          </div>

          {/* Right Panel - Product Preview */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700 h-full">
            <div className="relative h-[1020px] rounded-xl overflow-hidden border-2 border-gray-600">
              {data[0]?.orders_2?.style_number && (
                <div>
                  <ProductStyleImages
                    styleNumbers={data[0]?.orders_2?.style_number}
                    height="1020px"
                    imageCount="1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Info Card Component
const InfoCard = ({ label, value, valueClassName = 'bg-gray-700 text-white' }) => (
  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
    <span className="text-gray-300 font-medium">{label}: </span>
    <span className={`py-1 px-3 rounded-lg font-semibold text-sm ${valueClassName}`}>{value}</span>
  </div>
);

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p className="text-white mt-4 font-medium">Loading product preview...</p>
    </div>
  </div>
);

// Error Message Component
const ErrorMessage = ({ message }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80">
    <div className="text-center p-4">
      <div className="text-red-500 text-4xl mb-2">⚠️</div>
      <p className="text-white font-medium">{message}</p>
    </div>
  </div>
);

// Status Indicator Component
const StatusIndicator = ({ loading, hasData, error }) => {
  if (loading) {
    return (
      <div className="flex items-center text-yellow-400">
        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center text-red-400">
        <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
        Error
      </div>
    );
  }
};

export default ProductPage;
