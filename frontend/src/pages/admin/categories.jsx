import { useEffect, useState } from 'react';
import categoryService from '../../services/categoryService';

const Categories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.getAll().then(setCategories);
  }, []);

  return (
    <div className="container-fluid">
      <h4 className="mb-3">Categories</h4>

      <div className="card">
        <div className="card-body">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={cat.id}>
                  <td>{i + 1}</td>
                  <td>{cat.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories;
