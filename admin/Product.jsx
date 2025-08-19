import { useState,useEffect } from 'react';
import './Product.scss'
import axios from 'axios';
import AddProductModel from '../admin/AddProductModel';
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditProductModal from '../admin/EditProductModal';
import { Modal } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Notification from './Notification';
import { writeFile } from 'xlsx';
import * as XLSX from 'xlsx';
import Loading from './Loading'; // Import reusable Loading component


const Product = () => {

  
  const [products, setProducts] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]); // State to hold filtered products
  const [searchTerm, setSearchTerm] = useState(''); // State to hold search term
  const [loading, setLoading] = useState(true); // Loading state

  const apiUrl = import.meta.env.VITE_BACKEND_API;


  const fetchProducts = async () => {
    try {
      setLoading(true); // Show loader before API call
      const response = await axios.get(`https://wellworn-4.onrender.com/api/products`);
      const productsData = response.data.response;
      setProducts(productsData);
      setLoading(false); // Hide loader after API call
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false); // Hide loader even on error
    }
  };
  

  useEffect(() => {
    
    fetchProducts();

  }, []);

  

  const toggleEditModal = (productId = null) => {
    setIsEditModalOpen((prevState) => !prevState);
    setSelectedProduct(productId ? products.find(product => product.ProductId === productId) : null);
  };
  

  const toggleAddModal = () => {
    setIsAddModalOpen(!isAddModalOpen);
    
  };

  useEffect(() => {
    // Filter products based on search term applied to product names and product IDs
    const filtered = products.filter(product => 
      product.ProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.ProductId.toString().includes(searchTerm) // Assuming ProductId is a number
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);
  

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  

  const handleDelete = async (productId) => {
    try {
      await axios.delete(`https://wellworn-4.onrender.com/api/deleteproduct/${productId}`);
      setProducts(products.filter(product => product.ProductId !== productId));
      toast.success('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product.');
    }
  };

  
  const generateExcel = () => {
    // Mapping each product to restructure the data as needed for the report
    const data = products.map(product => ({
        'ID': product.ProductId,
        'Product Name': product.ProductName,
        'Categories': product.Categories.join(', '), // Join categories array into a single string
        'Areas': product.Areas.join(', '), // Join areas array into a single string
        'Variants': product.Variations.map(variant => // Map over variations to create a string for each
            `Size: ${variant.size}, Name: ${variant.name}, Count: ${variant.count}, Price: ${variant.price}`).join('; '), // Join all variants into a single string
        'Description': product.Description
    }));

    // Use XLSX library to generate Excel sheet
    const ws = XLSX.utils.json_to_sheet(data); // Create worksheet from JSON data
    const wb = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Products'); // Append worksheet to workbook with the name 'Products'
    
    const filename = 'product_report.xlsx'; // Set the filename for the Excel file
    writeFile(wb, filename); // Write the workbook to a file
};

if (loading) {
  return <Loading />; // Show reusable Loading component
}
return (
  <div>    <Notification/>

  <div className='ProductContainer'>
    <div className="productsecondiv">
      <h1 className='PRODUCTTITLE'>Products Section</h1>
      
      <div className="search-barrrr">
        <input
          type="text"
          placeholder="Search by Name or ID..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button className="search-buttonrrrr">
          <i className="fas fa-search" />
        </button>
      </div>

      <div className='gogg'>

        <div className="addProductSection">
          <button type='button' className='PRODUCTADDPRO' onClick={toggleAddModal}>
            <i className="fas fa-plus"></i> Add Products
          </button>
          <Modal open={isAddModalOpen} onClose={toggleAddModal} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AddProductModel onClose={toggleAddModal} />
          </Modal>
        </div>

        <button className="report-button" onClick={generateExcel}>
          Generate Report
        </button>

      </div>

      

      <p>
        Showing {filteredProducts.length} products
      </p>
      
      <div className="product-table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Product Name</th>
              <th>Price</th>
              <th colSpan={2}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.ProductId}>
                <td>{product.ProductId}</td>
                <td>
                  {product.ImgUrls && product.ImgUrls.length > 0 ? (
                    <img
                      src={product.ImgUrls[0]}
                      alt={product.ProductName}
                      onError={(e) => { e.target.src = 'default-placeholder-image-url.png'; }} 
                    />
                  ) : (
                    <div>No Image</div>
                  )}
                </td>
                <td>{product.ProductName}</td>
                <td>{`${Math.min(...product.Variations.map(variation => variation.price))} - ${Math.max(...product.Variations.map(variation => variation.price))}`}</td>
                <td>
                  <button className="edit-btn" onClick={() => toggleEditModal(product.ProductId)}>Edit</button>
                </td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(product.ProductId)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isEditModalOpen && (
  <Modal
    open={isEditModalOpen}
    onClose={() => toggleEditModal()} // Ensures modal closes on backdrop click
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
  <EditProductModal
    onClose={() => toggleEditModal()} // Passes close handler to EditProductModal
    product={selectedProduct}
  />
  </Modal>
)}

      <ToastContainer/>
    </div>

    </div>
  </div>
);

}

export default Product