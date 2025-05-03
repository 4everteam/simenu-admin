import { useEffect, useRef, useState } from 'react';
import { getTable, deleteTable, getQRTable, requestQRTable, deleteQRTable } from '../../fetch/table-management';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getTimeElapsed } from '../../utils/formatDate';
import TableOrderItem from './components/TableOrderItem';
import PaymentBill from './components/PaymentBill';

interface TableData {
  id: string;
  code: string;
  status: string;
  capacity: number;
}

interface QRResponse {
  url: string;
  updated_at: string;
}

const DetailTable = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [qrLoading, setQRLoading] = useState<boolean>(false);
  const [qrValue, setQrValue] = useState<string>('');
  const [qrSize, setQrSize] = useState<number>(128);
  const [qrGenerated, setQrGenerated] = useState<boolean>(false);
  const [timeQRGenerated, setTimeQRGenerated] = useState<string>('');
  const fetchedRef = useRef<boolean>(false);

  const fetchTableDetail = async (tableCode: string) => {
    try {
      setLoading(true);        
      const responseDataTable = await getTable({ code: tableCode });
      const responseQRTable = await getQRTable({ code: tableCode });

      setTableData(responseDataTable);
      
      // Handle QR code response
      if (responseQRTable && typeof responseQRTable === 'object') {
        if ('errors' in responseQRTable) {
          setQrGenerated(false);
        } else if ('url' in responseQRTable && 'updated_at' in responseQRTable) {
          const qrData = responseQRTable as QRResponse;
          setQrValue(qrData.url);
          setTimeQRGenerated(getTimeElapsed(qrData.updated_at));
          setQrGenerated(true);
        }
      } else {
        setQrGenerated(false);
      }
    } catch (error) {
      console.error('Error fetching table details:', error);
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {  
    // Skip if we've already fetched the data
    if (fetchedRef.current || !code) return;
    
    fetchTableDetail(code);
    fetchedRef.current = true;
  }, [code]);  

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!tableData) return;
    
    try {
      setDeleteLoading(true);
      const response = await deleteTable({ code: tableData.code });
      if (response) {
        // Redirect to table list after successful deletion
        navigate('/admin/kelola-meja');
      } else {
        setError('Failed to delete table');
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      setError('An error occurred while deleting the table');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const regenerateQR = async (tableCode: string) => {
    if (!tableData) return;
    
    try {
      setQRLoading(true);
      const response = await requestQRTable({ code: tableCode });
      
      if (response && typeof response === 'object' && 'url' in response) {
        setQrValue(response.url);
        setTimeQRGenerated(getTimeElapsed(response.updated_at));
        setQrGenerated(true);
        fetchTableDetail(tableCode);
      } else {
        throw new Error('Invalid QR code response');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('Failed to generate QR code');
    } finally {
      setQRLoading(false);
    }
  };

  const printQR = () => {
    if (!tableData || !qrGenerated) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the QR code');
      return;
    }
    
    const qrCode = document.getElementById('qr-code-canvas');
    if (!qrCode) return;
    
    const qrImage = (qrCode as HTMLElement).outerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>siMenu - Scan, Pesan, Santai! Semua Mudah dengan siMenu</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              text-align: center;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .qr-tent {
              width: 100%;
              height: auto;
              max-width: 361px;
              max-height: 505px;
              margin: 0 auto;
              background-color: #f9f5f2;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20px;
              box-sizing: border-box;
            }
            .logo-placeholder {
              border: 1px solid #333;
              padding: 5px 15px;
              margin-bottom: 10px;
              font-size: 14px;
              text-transform: uppercase;
            }
            .custom-text {
              font-size: 12px;
              color: #555;
              margin-bottom: 5px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .scan-text {
              font-size: 32px;
              font-weight: bold;
              margin: 10px 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .view-menu-text {
              font-size: 18px;
              text-transform: uppercase;
              margin-bottom: 15px;
              letter-spacing: 1px;
            }
            .qr-container {
              margin: 15px auto;
              background: white;
              padding: 5px;
            }
            .social-info {
              margin-top: 15px;
              font-size: 12px;
              color: #555;
            }
            .reviews-text {
              margin-top: 5px;
              font-size: 12px;
              color: #555;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            @media print {
              body {
                background: none;
                margin: 0;
                padding: 0;
              }
              .qr-tent {
                width: 361px;
                height: 505px;
                box-shadow: none;
                margin: 0 auto;
                page-break-inside: avoid;
              }
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-tent">
            <div class="logo-placeholder">YOUR LOGO</div>
            <div class="custom-text">ADD CUSTOM TEXT HERE</div>
            <div class="scan-text">SCAN ME</div>
            <div class="view-menu-text">TO VIEW OUR MENU</div>
            <div class="qr-container">
              ${qrImage}
            </div>
            <div class="reviews-text">
              REVIEWS AND COMMENTS<br>ARE APPRECIATED!
            </div>
          </div>
          <button onclick="window.print();return false;" class="print-button" style="padding: 10px 20px; background: #3C50E0; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">
            Print QR Code
          </button>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const handleDeleteQR = async (tableCode: string) => {
    if (!tableCode) return;
    
    try {
      setQRLoading(true);
      setError(null);
      
      const response = await deleteQRTable({ code: tableCode });
      if (!response) {
        // Reset QR state instead of reloading the page
        setQrValue('');
        setQrGenerated(false);
        setTimeQRGenerated('');
        
        // Fetch updated table data
        fetchTableDetail(tableCode);
      } else {
        console.log(response)
        throw new Error('Failed to delete QR code');
      }
    } catch (error) {
      console.error('Error deleting QR code:', error);
      setError('Failed to delete QR code');
    } finally {
      setQRLoading(false);
    }
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Render loading state
  const renderLoading = () => (
    <div className="flex justify-center py-10">
      <div className="spinner"></div>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <p className="text-danger">{error}</p>
    </div>
  );

  // Render QR code section
  const renderQRCode = () => (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex justify-between border-b border-stroke py-4 px-6.5 dark:border-strokedark">
        <div>
          <h3 className="font-medium text-black dark:text-white mt-1 flex items-center">
            QR Code
            <div className="relative group ml-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 text-bodydark2 cursor-help" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-black text-white text-xs rounded shadow-lg z-10">
                {timeQRGenerated ? `Terakhir digenerate: ${timeQRGenerated}` : 'QR Code belum digenerate'}
                <div className="absolute left-0 top-full w-3 h-3 -mt-1 ml-2 transform rotate-45 bg-black"></div>
              </div>
            </div>
          </h3>
          <p className="text-[11px]">Pastikan generate QR Code yang terbaru, sebelum di beri ke pelanggan.</p>
        </div>
        <button 
          onClick={() => tableData && regenerateQR(tableData.code)}
          className="inline-flex items-center justify-center rounded-md border border-primary py-1 px-2 text-center font-medium text-primary hover:bg-primary hover:text-white text-sm"
        >
          Generate QR Code
        </button>
      </div>
      <div className="p-6.5">
        <div className="mb-4.5 flex flex-col items-center">
          {qrLoading ? (
            <div className="flex justify-center items-center h-40 w-full">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : qrGenerated ? (
            <div className="bg-white p-4 rounded-md shadow-sm mb-4">
              <QRCodeSVG 
                id="qr-code-canvas"
                value={qrValue}
                size={qrSize}
                level="H"
                includeMargin={true}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center h-40 w-full">
              <div className="text-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-16 w-16 mx-auto mb-2 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                <p>Please generate the QR</p>
              </div>
            </div>
          )}
          {qrGenerated && (
            <div className="flex flex-col w-full gap-4">
              <div>
                <label className="mb-2.5 block text-black dark:text-white text-sm">
                  Ukuran QR Code: {qrSize}px
                </label>
                <input
                  type="range"
                  min="64"
                  max="256"
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <button
                onClick={printQR}
                className="inline-flex items-center justify-center rounded-md bg-success py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 flex-1"
              >
                Print QR Code
              </button>
              <button
                onClick={(e) => tableData && handleDeleteQR(tableData.code)}
                className="inline-flex items-center justify-center rounded-md bg-danger py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 flex-1"
              >
                Delete QR Code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render delete confirmation modal
  const renderDeleteConfirmModal = () => (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-md rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-7.5">
        <div className="mb-5.5 flex flex-col">
          <h3 className="mb-3 text-xl font-bold text-black dark:text-white">
            Konfirmasi Hapus
          </h3>
          <p className="text-sm text-body dark:text-bodydark">
            Apakah Anda yakin ingin menghapus meja dengan kode <strong>{tableData?.code}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            disabled={deleteLoading}
          >
            Batal
          </button>
          <button
            onClick={handleConfirmDelete}
            className="flex justify-center rounded bg-danger py-2 px-6 font-medium text-white hover:bg-opacity-90"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Breadcrumb pageName="Detail Meja" />
      
      {loading ? renderLoading() : 
       error ? renderError() : 
       tableData ? (
        <div className="flex flex-col gap-9">
          {/* Profile Header Section */}
          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-5">
            <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-black dark:text-white">
                    Meja [{tableData.code}]
                  </h3>
                  <p className={`mt-1 text-sm font-medium ${
                    tableData.status === 'tersedia' 
                      ? 'text-success' 
                      : tableData.status === 'terisi' 
                        ? 'text-danger' 
                        : 'text-warning'
                  }`}>
                    {capitalizeFirstLetter(tableData.status)}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Link 
                  to={`/admin/update-kelola-meja/${tableData.code}`} 
                  className="inline-flex items-center justify-center rounded-md border border-primary py-2 px-4 text-center font-medium text-primary hover:bg-primary hover:text-white mr-2"
                >
                  Edit Meja
                </Link>
                <button 
                  onClick={handleDeleteClick}
                  className="inline-flex items-center justify-center rounded-md border border-danger py-2 px-4 text-center font-medium text-danger hover:bg-danger hover:text-white"
                >
                  Hapus Meja
                </button>
              </div>
            </div>
          </div>
          
          {tableData.status !== 'maintenance' ? (
            <>
              <div className="grid grid-cols-1 gap-9 md:grid-cols-2">
                {/* Table Details Section */}
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                      Detail Meja
                    </h3>
                  </div>
                  <div className="p-6.5">
                    <div className="mb-4.5">
                      <div className="flex flex-col gap-6">
                        <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                          <span className="font-medium text-black dark:text-white">ID</span>
                          <span className="text-sm text-black dark:text-white">{tableData.id}</span>
                        </div>
                        <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                          <span className="font-medium text-black dark:text-white">Kode Meja</span>
                          <span className="text-sm text-black dark:text-white">{tableData.code}</span>
                        </div>
                        <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                          <span className="font-medium text-black dark:text-white">Status</span>
                          <span className={`text-sm ${
                            tableData.status === 'tersedia' 
                              ? 'text-success' 
                              : tableData.status === 'terisi' 
                                ? 'text-danger' 
                                : 'text-warning'
                          }`}>
                            {capitalizeFirstLetter(tableData.status)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-black dark:text-white">Kapasitas</span>
                          <span className="text-sm text-black dark:text-white">{tableData.capacity} orang</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Generator Section */}
                {renderQRCode()}
              </div>
              <div>
                <PaymentBill
                  tableCode={code || ''}
                  onPaymentComplete={() => navigate(`/admin/detail-meja/${code}`)} 
                />
              </div>
              <div>
                <TableOrderItem code={code || ''}/>
              </div>
            </>
          ) : (
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6.5">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4">
                  <svg
                    className="h-16 w-16 text-warning"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-black dark:text-white">
                  Table Under Maintenance
                </h3>
                <p className="mb-6 text-sm text-body dark:text-bodydark">
                  This table is currently unavailable due to maintenance work.
                  Please check back later or contact support for more information.
                </p>
                <Link
                  to="/admin/kelola-meja"
                  className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-white hover:bg-opacity-90"
                >
                  Return to Table List
                </Link>
              </div>
            </div>
          )}
          
          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && renderDeleteConfirmModal()}
        </div>
      ) : null}
    </>
  );
};

export default DetailTable;