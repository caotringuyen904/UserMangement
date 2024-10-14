import { useState, useEffect } from 'react';
import { getUserAndPagination, deleteUser, exportCSV } from './apiService';
import Signup from './signUp';

function App() {
    const [pageSize, setPageSize] = useState(5);
    const [pageIndex, setPageIndex] = useState(1);
    const [count, setCount] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    const [users, setUsers] = useState([]);
    const [isOpenForm, setIsOpenForm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUsersByPage, setSelectedUsersByPage] = useState({}); // Lưu trạng thái chọn theo pageIndex
    const [selectAllByPage, setSelectAllByPage] = useState({}); // Trạng thái selectAll cho từng trang
    const [isExporting, setIsExporting] = useState(false); // Loading state for exporting
    const [exportMessage, setExportMessage] = useState(''); // Message to show during export

    const handleSelectUser = (userId) => {
        const updatedSelectedUsers = new Set(selectedUsersByPage[pageIndex] || []);

        if (updatedSelectedUsers.has(userId)) {
            updatedSelectedUsers.delete(userId);
        } else {
            updatedSelectedUsers.add(userId);
        }

        setSelectedUsersByPage({
            ...selectedUsersByPage,
            [pageIndex]: updatedSelectedUsers
        });
    };

    // Handle select/deselect all users on the current page
    const handleSelectAllUsers = () => {
        const updatedSelectedUsers = new Set(selectedUsersByPage[pageIndex] || []);

        if (!selectAllByPage[pageIndex]) {
            // Chọn tất cả người dùng trên trang hiện tại
            users.forEach(user => updatedSelectedUsers.add(user._id));
        } else {
            // Bỏ chọn tất cả người dùng trên trang hiện tại
            users.forEach(user => updatedSelectedUsers.delete(user._id));
        }

        setSelectedUsersByPage({
            ...selectedUsersByPage,
            [pageIndex]: updatedSelectedUsers
        });

        setSelectAllByPage({
            ...selectAllByPage,
            [pageIndex]: !selectAllByPage[pageIndex]
        });
    };

    const exportSelectedUsers = async () => {
      const selectedUsers = new Set();
  
      // Gộp tất cả người dùng đã chọn trên các trang
      Object.values(selectedUsersByPage).forEach(selected => {
          selected.forEach(user => selectedUsers.add(user));
      });
  
      if (selectedUsers.size === 0) return; // Không làm gì nếu không có user nào được chọn
  
      setIsExporting(true); // Show loading modal
      setExportMessage(`Exporting ${selectedUsers.size} selected users...`); // Set export message
  
      try {
          const usersArray = Array.from(selectedUsers); // Convert Set to Array
          await exportCSV(usersArray); // Call API to export CSV with selected user IDs
  
          // Wait for 2 seconds before hiding the loading modal
          setTimeout(() => {
              setIsExporting(false); // Hide loading modal after 2 seconds
  
              // Reset selectAll và selectedUsers cho từng trang sau khi export
              setSelectAllByPage({});
              setSelectedUsersByPage({});
          }, 2000);
  
      } catch (error) {
          console.error("Error exporting CSV:", error);
          setIsExporting(false); // Ensure loading modal is hidden on error
      }
  };
  

    const getData = async () => {
        try {
            const result = await getUserAndPagination(pageSize, pageIndex);
            setUsers(result.data?.users);
            setCount(result.data?.count);
            setTotalPage(result.data?.totalPage);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getData();
    }, [pageSize, pageIndex]);

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await deleteUser(userToDelete._id);
            setUsers(users.filter(user => user?._id !== userToDelete._id));
            setCount(count - 1);
            setUserToDelete(null);
            setIsDeleteModalOpen(false);
            getData();
        } catch (error) {
            console.error(error);
        }
    };

    const handlePrevPage = () => {
        if (pageIndex > 1) {
            setPageIndex(pageIndex - 1);
        }
    };

    const handleNextPage = () => {
        if (pageIndex < totalPage) {
            setPageIndex(pageIndex + 1);
        }
    };

    const startIndex = (pageIndex - 1) * pageSize + 1;
    const endIndex = Math.min(startIndex + pageSize - 1, count);

    const openForm = () => setIsOpenForm(true);
    const closeForm = () => setIsOpenForm(false);

    const handleUserAdded = () => {
        getData();
        setIsOpenForm(false);
    };

    const confirmDeleteUser = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const cancelDelete = () => {
        setUserToDelete(null);
        setIsDeleteModalOpen(false);
    };

    return (
        <div className="container">
            <button className="open-button" onClick={openForm}>SIGN UP</button>
            <Signup isOpenForm={isOpenForm} closeForm={closeForm} onUserAdded={handleUserAdded} />
            <button
                className="open-button"
                onClick={exportSelectedUsers}
                disabled={!Object.values(selectedUsersByPage).some(set => set.size > 0)}
            >
                EXPORT
            </button>
            <table>
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                checked={selectAllByPage[pageIndex] || false}
                                onChange={handleSelectAllUsers}
                            />
                        </th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={index}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedUsersByPage[pageIndex]?.has(user._id) || false}
                                    onChange={() => handleSelectUser(user._id)}
                                />
                            </td>
                            <td>{user.firstname}</td>
                            <td>{user.lastname}</td>
                            <td>{user.email}</td>
                            <td>
                                <button onClick={() => confirmDeleteUser(user)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <button onClick={handlePrevPage} disabled={pageIndex === 1}>&lt;</button>
                <span>{startIndex}-{endIndex} of {count} users</span>
                <button onClick={handleNextPage} disabled={pageIndex === totalPage}>&gt;</button>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Delete user?</h3>
                        <p>Are you sure you want to delete this user?</p>
                        <div className="modal-actions">
                            <button onClick={handleDeleteUser}>Delete</button>
                            <button onClick={cancelDelete}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading Modal */}
            {isExporting && (
                <div className="modal">
                    <div className="modal-content">
                        <p>...Loading</p>
                        <h3>{exportMessage}</h3>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
