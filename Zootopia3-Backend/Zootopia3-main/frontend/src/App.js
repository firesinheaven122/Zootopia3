import './App.css';
import { useEffect, useMemo, useState } from 'react';

const ROLE_LABELS = {
  admin: 'Администратор',
  seller: 'Продавец',
  client: 'Клиент',
};

const PAYMENT_LABELS = {
  cash: 'Наличные',
  card: 'Банковская карта',
};

const SPECIES_LABELS = {
  dog: 'Собака',
  cat: 'Кошка',
  bird: 'Птица',
  fish: 'Рыба',
  rodent: 'Грызун',
  other: 'Другое',
};

function roleLabel(role) {
  if (!role) return '';
  return ROLE_LABELS[role] || role;
}

function paymentLabel(paymentType) {
  if (!paymentType) return '';
  return PAYMENT_LABELS[paymentType] || paymentType;
}

function speciesLabel(species) {
  if (!species) return '—';
  return SPECIES_LABELS[species] || species;
}

function App() {
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });
  const [activeSection, setActiveSection] = useState('products');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pets, setPets] = useState([]);
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSearch, setProductSearch] = useState('');

  const [productForm, setProductForm] = useState({
    category_id: '',
    name: '',
    article: '',
    description: '',
    price: '',
    quantity: '',
    unit: 'шт',
    image_url: '',
  });
  const [categoryForm, setCategoryForm] = useState({ name: '', parent_id: '' });
  const [sidebarCategoriesOpen, setSidebarCategoriesOpen] = useState(true);
  const [productCategoryFilter, setProductCategoryFilter] = useState(null);
  const [petForm, setPetForm] = useState({
    owner_id: '',
    name: '',
    species: 'dog',
    breed: '',
    weight: '',
    body_girth: '',
    back_length: '',
  });
  const [saleForm, setSaleForm] = useState({
    client_id: '',
    payment_type: 'cash',
    items: '',
  });
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'seller',
  });

  const role = user?.role || '';
  const isAdmin = role === 'admin';
  const isSeller = role === 'seller' || isAdmin;
  const isClient = role === 'client' || isAdmin;

  const sections = useMemo(() => {
    const items = [];
    if (isClient) {
      items.push({ id: 'pets', label: 'Питомцы' });
      items.push({ id: 'recommendations', label: 'Рекомендации' });
      items.push({ id: 'sales', label: 'История покупок' });
    }
    if (isSeller) {
      if (!items.find((x) => x.id === 'sales')) items.push({ id: 'sales', label: 'История покупок' });
      items.push({ id: 'clients', label: 'Клиенты' });
    }
    if (isAdmin) {
      items.push({ id: 'users', label: 'Пользователи' });
      items.push({ id: 'audit', label: 'Аудит' });
    }
    return items;
  }, [isAdmin, isClient, isSeller]);

  const sectionTitles = {
    products: 'Товары',
    categories: 'Категории',
    pets: 'Питомцы',
    recommendations: 'Рекомендации',
    sales: 'История покупок',
    clients: 'Клиенты',
    users: 'Пользователи',
    audit: 'Журнал действий',
  };
  const categoryNameById = useMemo(
    () => Object.fromEntries(categories.map((cat) => [cat.id, cat.name])),
    [categories]
  );
  const productById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products]
  );
  const filteredProducts = useMemo(
    () =>
      products.filter((item) => {
        const q = productSearch.toLowerCase();
        const matchesSearch = item.name.toLowerCase().includes(q);
        const matchesCat =
          productCategoryFilter === null || Number(item.category_id) === Number(productCategoryFilter);
        return matchesSearch && matchesCat;
      }),
    [products, productSearch, productCategoryFilter]
  );

  async function api(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    let body = null;
    try {
      body = await response.json();
    } catch (e) {
      body = null;
    }
    if (!response.ok) {
      throw new Error(body?.detail || body?.message || `Ошибка ${response.status}`);
    }
    return body;
  }

  async function refreshMe() {
    if (!token) return;
    const me = await api('/auth/me');
    setUser(me);
  }

  async function loadSectionData(section) {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      if (section === 'products') {
        setProducts(await api('/products/'));
        if (categories.length === 0) setCategories(await api('/categories/'));
      }
      if (section === 'categories') setCategories(await api('/categories/'));
      if (section === 'pets') setPets(await api(isAdmin ? '/pets/' : '/pets/my'));
      if (section === 'sales') {
        setProducts(await api('/products/'));
        setSales(await api(isSeller ? '/sales/' : '/sales/my'));
      }
      if (section === 'clients') setClients(await api('/clients/'));
      if (section === 'users') setUsers(await api('/users/'));
      if (section === 'recommendations') {
        setProducts(await api('/products/'));
        setRecommendations(await api('/recommendations/my'));
      }
      if (section === 'audit') setAuditLogs(await api('/audit/all'));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    refreshMe().catch((e) => {
      setError(e.message);
      handleLogout();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token || !user) return;
    (async () => {
      try {
        const cats = await api('/categories/');
        setCategories(cats);
      } catch (e) {
        /* sidebar categories optional */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id]);

  useEffect(() => {
    if (!token || !user) return;
    loadSectionData(activeSection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, token, user?.role]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (authMode === 'login') {
        const data = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: authForm.email, password: authForm.password }),
        });
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setMessage('Вход выполнен');
      } else {
        await api('/auth/register', {
          method: 'POST',
          body: JSON.stringify(authForm),
        });
        setMessage('Регистрация успешна, теперь войдите');
        setAuthMode('login');
      }
    } catch (e2) {
      setError(e2.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setProducts([]);
    setCategories([]);
    setPets([]);
    setSales([]);
    setClients([]);
    setUsers([]);
    setRecommendations([]);
    setAuditLogs([]);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/products/', {
        method: 'POST',
        body: JSON.stringify({
          ...productForm,
          category_id: Number(productForm.category_id),
          price: Number(productForm.price),
          quantity: Number(productForm.quantity || 0),
        }),
      });
      setMessage('Товар создан');
      setProductForm({
        category_id: '',
        name: '',
        article: '',
        description: '',
        price: '',
        quantity: '',
        unit: 'шт',
        image_url: '',
      });
      loadSectionData('products');
    } catch (e2) {
      setError(e2.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      setMessage('Товар удален');
      loadSectionData('products');
    } catch (e) {
      setError(e.message);
    }
  };
  const openProductDetails = (product) => setSelectedProduct(product);
  const closeProductDetails = () => setSelectedProduct(null);

  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      await api('/categories/', {
        method: 'POST',
        body: JSON.stringify({
          name: categoryForm.name,
          parent_id: categoryForm.parent_id ? Number(categoryForm.parent_id) : null,
        }),
      });
      setMessage('Категория создана');
      setCategoryForm({ name: '', parent_id: '' });
      loadSectionData('categories');
    } catch (e2) {
      setError(e2.message);
    }
  };

  const savePet = async (e) => {
    e.preventDefault();
    try {
      await api('/pets/', {
        method: 'POST',
        body: JSON.stringify({
          ...petForm,
          owner_id: petForm.owner_id ? Number(petForm.owner_id) : undefined,
          weight: petForm.weight ? Number(petForm.weight) : null,
          body_girth: petForm.body_girth ? Number(petForm.body_girth) : null,
          back_length: petForm.back_length ? Number(petForm.back_length) : null,
        }),
      });
      setMessage('Питомец добавлен');
      setPetForm({
        owner_id: '',
        name: '',
        species: 'dog',
        breed: '',
        weight: '',
        body_girth: '',
        back_length: '',
      });
      loadSectionData('pets');
    } catch (e2) {
      setError(e2.message);
    }
  };

  const createSale = async (e) => {
    e.preventDefault();
    try {
      const items = saleForm.items
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((pair) => {
          const [productId, quantity] = pair.split(':').map((v) => Number(v.trim()));
          return { product_id: productId, quantity };
        });

      await api('/sales/', {
        method: 'POST',
        body: JSON.stringify({
          client_id: saleForm.client_id ? Number(saleForm.client_id) : null,
          payment_type: saleForm.payment_type,
          items,
        }),
      });
      setMessage('Продажа создана');
      setSaleForm({ client_id: '', payment_type: 'cash', items: '' });
      loadSectionData('sales');
    } catch (e2) {
      setError(e2.message);
    }
  };

  const saveUser = async (e) => {
    e.preventDefault();
    try {
      await api('/users/', { method: 'POST', body: JSON.stringify(userForm) });
      setMessage('Пользователь создан');
      setUserForm({ email: '', password: '', full_name: '', phone: '', role: 'seller' });
      loadSectionData('users');
    } catch (e2) {
      setError(e2.message);
    }
  };

  const blockClient = async (id) => {
    try {
      await api(`/clients/${id}/block`, { method: 'PUT' });
      setMessage('Клиент заблокирован');
      loadSectionData('clients');
    } catch (e) {
      setError(e.message);
    }
  };

  const unblockClient = async (id) => {
    try {
      await api(`/clients/${id}/unblock`, { method: 'PUT' });
      setMessage('Клиент разблокирован');
      loadSectionData('clients');
    } catch (e) {
      setError(e.message);
    }
  };

  const blockUser = async (id) => {
    try {
      await api(`/users/${id}/block`, { method: 'PUT' });
      setMessage('Пользователь заблокирован');
      loadSectionData('users');
    } catch (e) {
      setError(e.message);
    }
  };

  const unblockUser = async (id) => {
    try {
      await api(`/users/${id}/unblock`, { method: 'PUT' });
      setMessage('Пользователь разблокирован');
      loadSectionData('users');
    } catch (e) {
      setError(e.message);
    }
  };

  const generateRecommendations = async () => {
    try {
      const result = await api('/recommendations/generate', { method: 'POST' });
      setMessage(result.message || 'Рекомендации сгенерированы');
      loadSectionData('recommendations');
    } catch (e) {
      setError(e.message);
    }
  };

  const trainRecommendations = async () => {
    try {
      const result = await api('/recommendations/train', { method: 'POST' });
      setMessage(result.message || 'Модель обучена');
    } catch (e) {
      setError(e.message);
    }
  };

  const formatMoney = (value) => Number(value).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });

  const goToProducts = (categoryId) => {
    setProductCategoryFilter(categoryId);
    setActiveSection('products');
  };

                          /* ---------АВТОРИЗАЦИЯ -------------*/
              
  if (!token) {
    return (
      <div className="auth-page">
        <div className="card auth-card auth-figma">
          <h1 className="auth-brand">Зоомагазин</h1>
          <h2 className="auth-title">{authMode === 'login' ? 'Вход в систему' : 'Регистрация'}</h2>
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            <label htmlFor="email">Email</label>
            <input id="email" placeholder="example@email.com" type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
            <label htmlFor="password">Пароль</label>
            <div className="password-wrap">
              <input
                id="password"
                placeholder="Минимум 6 символов"
                type={showPassword ? 'text' : 'password'}
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? '⌣' : '👁️'}
              </button>
            </div>
            {authMode === 'register' && (
              <>
                <label htmlFor="full_name">Имя Фамилия</label>
                <input id="full_name" placeholder="Иван Иванов" value={authForm.full_name} onChange={(e) => setAuthForm({ ...authForm, full_name: e.target.value })} required />
                <label htmlFor="phone">Телефон</label>
                <input id="phone" placeholder="+7..." value={authForm.phone} onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} />
              </>
            )}
            <button type="submit" className="primary auth-submit">{authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}</button>
          </form>
          <button className="link-btn" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
            {authMode === 'login' ? 'Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
          {error && <p className="error-text auth-notice">{error}</p>}
          {message && <p className="success-text auth-notice">{message}</p>}
        </div>
      </div>
    );
  }

                               /* ---------БОКОВАЯ ПАНЕЛЬ УПРАВЛЕНИЯ -------------*/

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 className="sidebar-brand">Зоомагазин</h2>
        <div className="user-chip">
          <p className="user-name">{user?.full_name}</p>
          <p className="user-role">{roleLabel(user?.role)}</p>
        </div>
        <nav className="menu">
          <button
            type="button"
            className={activeSection === 'products' ? 'menu-item active' : 'menu-item'}
            onClick={() => {
              setProductCategoryFilter(null);
              setActiveSection('products');
            }}
          >
            
            <span>Товары</span>
          </button>

          <div className="sidebar-dropdown">
            <button
              type="button"
              className="menu-item sidebar-dropdown-toggle"
              onClick={() => setSidebarCategoriesOpen((v) => !v)}
            >
              
              <span className="sidebar-dropdown-label">Категории</span>
              <span className="sidebar-dropdown-chevron">{sidebarCategoriesOpen ? '▲' : '▼'}</span>
            </button>
            {sidebarCategoriesOpen && (
              <div className="sidebar-dropdown-list">
                <button
                  type="button"
                  className={
                    activeSection === 'products' && productCategoryFilter === null
                      ? 'sidebar-subitem active'
                      : 'sidebar-subitem'
                  }
                  onClick={() => goToProducts(null)}
                >
                  Все товары
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={
                      activeSection === 'products' && productCategoryFilter === c.id
                        ? 'sidebar-subitem active'
                        : 'sidebar-subitem'
                    }
                    onClick={() => goToProducts(c.id)}
                  >
                    {c.name}
                  </button>
                ))}
                {isAdmin && (
                  <button
                    type="button"
                    className="sidebar-subitem sidebar-subitem-admin"
                    onClick={() => setActiveSection('categories')}
                  >
                    Управление категориями
                  </button>
                )}
              </div>
            )}
          </div>

          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={activeSection === section.id ? 'menu-item active' : 'menu-item'}
              onClick={() => setActiveSection(section.id)}
            >
             
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </aside>
      <main className="content">
        <header className="topbar">
          <h1>{sectionTitles[activeSection] || 'Панель'}</h1>
        </header>
        {loading && <p className="muted app-notice">Загрузка...</p>}
        {error && <p className="error-text app-notice">{error}</p>}

        {activeSection === 'products' && (
          <section className="card section-card">
            <div className="section-header">
              <input
                className="search-input"
                placeholder="Поиск по названию..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

                                {/*---------ДОБАВЛЕНИЕ ТОВАРА -------------*/}

            {isAdmin && (
              <form className="form-grid" onSubmit={saveProduct}>
                <h3 className="section-form-title">Добавить товар</h3>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input placeholder="Название" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                <input placeholder="Артикул" value={productForm.article} onChange={(e) => setProductForm({ ...productForm, article: e.target.value })} />
                <input placeholder="Цена" type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                <input placeholder="Кол-во" type="number" value={productForm.quantity} onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })} />
                <input placeholder="Ед. изм" value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })} />
                <input placeholder="URL картинки" value={productForm.image_url} onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })} />
                <textarea placeholder="Описание" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                <button type="submit" className="primary">Сохранить</button>
              </form>
            )}
            <div className="product-grid">
              {filteredProducts.map((item) => (
                <article key={item.id} className="product-card">
                  <div className="product-thumb">
                    <img src={item.image_url || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&h=400&fit=crop'} alt={item.name} />
                  </div>
                  <div className="product-body">
                    <h3>{item.name}</h3>
                    
                    <div className="product-meta">
                      <span className="product-price">{formatMoney(item.price)}</span>
                      
                    </div>
                    <div className="product-actions">
                      <button className="primary" onClick={() => openProductDetails(item)}>Подробнее</button>
                      {isAdmin && <button onClick={() => removeProduct(item.id)}>Удалить</button>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {filteredProducts.length === 0 && <p className="muted">Товары не найдены</p>}
          </section>
        )}

        {activeSection === 'categories' && isAdmin && (
          <section className="card section-card">
            <div className="section-header">
              <h3 className="section-title">Управление категориями</h3>
            </div>
            <form className="inline-form" onSubmit={saveCategory}>
              <input
                placeholder="Название категории"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                required
              />
              <select
                value={categoryForm.parent_id}
                onChange={(e) => setCategoryForm({ ...categoryForm, parent_id: e.target.value })}
              >
                <option value="">Без родительской категории</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button className="primary" type="submit">
                Добавить
              </button>
            </form>
            <ul className="category-admin-list">
              {categories.map((c) => (
                <li key={c.id} className="category-admin-row">
                  <span className="category-admin-name">{c.name}</span>
                  {c.parent_id != null && (
                    <span className="muted">
                      вложена в: {categoryNameById[c.parent_id] || 'категория'}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

                                  {/* --------ПИТОМЦЫ ------------- */}

        {activeSection === 'pets' && (
          <section className="card section-card">
            <div className="section-header">
              <h3 className="section-title">Профиль питомцев</h3>
            </div>
            <form className="form-grid" onSubmit={savePet}>
              <h3 className="section-form-title">Добавить питомца</h3>
              {isAdmin && (
                <input
                  placeholder="ID владельца (только для администратора)"
                  value={petForm.owner_id}
                  onChange={(e) => setPetForm({ ...petForm, owner_id: e.target.value })}
                />
              )}
              <input placeholder="Кличка" value={petForm.name} onChange={(e) => setPetForm({ ...petForm, name: e.target.value })} required />
              <select value={petForm.species} onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}>
                <option value="dog">Собака</option>
                <option value="cat">Кошка</option>
                <option value="bird">Птица</option>
                <option value="fish">Рыба</option>
                <option value="rodent">Грызун</option>
                <option value="other">Другое</option>
              </select>
              <input placeholder="Порода" value={petForm.breed} onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })} />
              <input placeholder="Вес, кг" value={petForm.weight} onChange={(e) => setPetForm({ ...petForm, weight: e.target.value })} />
              <input placeholder="Обхват, см" value={petForm.body_girth} onChange={(e) => setPetForm({ ...petForm, body_girth: e.target.value })} />
              <input placeholder="Длина спины, см" value={petForm.back_length} onChange={(e) => setPetForm({ ...petForm, back_length: e.target.value })} />
              <button type="submit" className="primary">Сохранить</button>
            </form>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Кличка</th>
                  <th>Вид</th>
                  <th>Порода</th>
                </tr>
              </thead>
              <tbody>
                {pets.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{speciesLabel(p.species)}</td>
                    <td>{p.breed || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}


                                 {/* --------- ИСТОРИЯ ПОКУПОК ------------- */}

        {activeSection === 'sales' && (
          <section className="card section-card">
            {isSeller && (
              <form className="form-grid" onSubmit={createSale}>
                <h3 className="section-form-title">Оформить продажу</h3>
                <input
                  placeholder="Клиент (необязательно, внутренний номер)"
                  value={saleForm.client_id}
                  onChange={(e) => setSaleForm({ ...saleForm, client_id: e.target.value })}
                />
                <select
                  value={saleForm.payment_type}
                  onChange={(e) => setSaleForm({ ...saleForm, payment_type: e.target.value })}
                >
                  <option value="cash">Наличные</option>
                  <option value="card">Банковская карта</option>
                </select>
                <input
                  placeholder="Позиции: номер_товара:количество, через запятую"
                  value={saleForm.items}
                  onChange={(e) => setSaleForm({ ...saleForm, items: e.target.value })}
                  required
                />
                <button className="primary" type="submit">
                  Создать
                </button>
              </form>
            )}
            <div className="purchase-list">
              {sales.length === 0 && <p className="muted">Пока нет покупок</p>}
              {sales.map((sale) => (
                <div key={sale.id} className="purchase-block">
                  <div className="purchase-header">
                    <span>{new Date(sale.created_at).toLocaleString('ru-RU')}</span>
                    <span className="purchase-total">{formatMoney(sale.total_amount)}</span>
                    <span className="purchase-pay">{paymentLabel(sale.payment_type)}</span>
                  </div>
                  <div className="product-grid product-grid-tight">
                    {(sale.items || []).map((line) => {
                      const p = productById[line.product_id];
                      return (
                        <article
                          key={`${sale.id}-${line.id}`}
                          className="product-card product-card-compact"
                        >
                          <div className="product-thumb">
                            <img
                              src={
                                p?.image_url ||
                                'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&h=400&fit=crop'
                              }
                              alt={p?.name || 'Товар'}
                            />
                          </div>
                          <div className="product-body">
                            <h3>{p?.name || 'Товар удалён или недоступен'}</h3>
                            <div className="product-meta">
                              <span className="muted">Количество: {line.quantity}</span>
                              <span className="product-price">{formatMoney(line.subtotal)}</span>
                            </div>
                            {p && (
                              <button type="button" className="primary" onClick={() => openProductDetails(p)}>
                                Подробнее
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

                                  {/*---------КЛИЕНТЫ -------------*/}

        {activeSection === 'clients' && (
          <section className="card section-card">
            <div className="section-header">
              <h3 className="section-title">Клиенты</h3>
            </div>
            <input placeholder="Email" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
              <input placeholder="Пароль" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required />
              <input placeholder="Имя Фамилия" value={userForm.full_name} onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} required />
              <input placeholder="Телефон" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
              <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                <option value="client">Клиент</option>
              </select>
              <button className="primary" type="submit">Создать</button>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ФИО</th>
                  <th>Email</th>
                  <th>Статус</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td>{c.full_name}</td>
                    <td>{c.email}</td>
                    <td>{c.is_active ? 'Активен' : 'Заблокирован'}</td>
                    <td>
                      {isAdmin &&
                        (c.is_active ? (
                          <button type="button" onClick={() => blockClient(c.id)}>
                            Заблокировать
                          </button>
                        ) : (
                          <button type="button" onClick={() => unblockClient(c.id)}>
                            Разблокировать
                          </button>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

                                  {/*---------СОТРУДНИКИ -------------*/}

        {activeSection === 'users' && isAdmin && (
          <section className="card section-card">
            <div className="section-header">
            </div>
            <form className="form-grid" onSubmit={saveUser}>
              <h3 className="section-form-title">Создать сотрудника или пользователя</h3>
              <input placeholder="Email" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
              <input placeholder="Пароль" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required />
              <input placeholder="ФИО" value={userForm.full_name} onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} required />
              <input placeholder="Телефон" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
              <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                <option value="seller">Продавец</option>
                <option value="admin">Администратор</option>
                <option value="client">Клиент</option>
              </select>
              <button className="primary" type="submit">Создать</button>
            </form>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Имя Фамилия</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Статус</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>{roleLabel(u.role)}</td>
                    <td>{u.is_active ? 'Активен' : 'Заблокирован'}</td>
                    <td>
                      {u.is_active ? (
                        <button type="button" onClick={() => blockUser(u.id)}>
                          Заблокировать
                        </button>
                      ) : (
                        <button type="button" onClick={() => unblockUser(u.id)}>
                          Разблокировать
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

                                  {/*---------РЕКОМЕНДАЦИИ -------------*/}

        {activeSection === 'recommendations' && (
          <section className="card section-card">
            <div className="section-header">
            </div>
            <div className="actions">
              {(role === 'client' || isAdmin) && (
                <button type="button" className="primary" onClick={generateRecommendations}>
                  Сгенерировать рекомендации
                </button>
              )}
              {isAdmin && (
                <button type="button" onClick={trainRecommendations}>
                  Обучить модель
                </button>
              )}
            </div>
            <div className="product-grid">
              {recommendations.length === 0 && <p className="muted">Рекомендаций пока нет</p>}
              {recommendations.map((r) => {
                const p = productById[r.product_id];
                if (!p) {
                  return (
                    <article key={r.id} className="product-card product-card-fallback">
                      <div className="product-body">
                        <h3>Товар недоступен в каталоге</h3>
                        {r.reason && <p className="rec-reason">{r.reason}</p>}
                      </div>
                    </article>
                  );
                }
                return (
                  <article key={r.id} className="product-card">
                    <div className="product-thumb">
                      <img
                        src={
                          p.image_url ||
                          'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&h=400&fit=crop'
                        }
                        alt={p.name}
                      />
                    </div>
                    <div className="product-body">
                      <h3>{p.name}</h3>
                      <p className="muted">{categoryNameById[p.category_id] || ''}</p>
                      {r.reason && <p className="rec-reason">{r.reason}</p>}
                      <div className="product-meta">
                        <span className="product-price">{formatMoney(p.price)}</span>
                        
                      </div>
                      <div className="product-actions">
                        <button type="button" className="primary" onClick={() => openProductDetails(p)}>
                          Подробнее
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

                                  {/*---------АУДИТ -------------*/}

        {activeSection === 'audit' && isAdmin && (
          <section className="card section-card">
            <div className="section-header">
              <h3 className="section-title">Журнал действий</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Действие</th>
                  <th>Объект</th>
                  <th>Тип записи</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.action}</td>
                    <td>{log.entity}</td>
                    <td>{log.log_type === 'operator' ? 'Оператор' : 'Пользователь'}</td>
                    <td>{new Date(log.created_at).toLocaleString('ru-RU')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
      {selectedProduct && (
        <div className="modal-overlay" onClick={closeProductDetails}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>{selectedProduct.name}</h3>
              <button onClick={closeProductDetails}>✕</button>
            </div>
            <img
              className="modal-image"
              src={selectedProduct.image_url || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=1000&h=700&fit=crop'}
              alt={selectedProduct.name}
            />
            <div className="modal-grid">
              <p><strong>Цена:</strong> {formatMoney(selectedProduct.price)}</p>
              <p><strong>Остаток:</strong> {selectedProduct.quantity} {selectedProduct.unit}</p>
              <p><strong>Категория:</strong> {categoryNameById[selectedProduct.category_id] || selectedProduct.category_id}</p>
              <p><strong>Артикул:</strong> {selectedProduct.article || '-'}</p>
            </div>
            <p className="modal-description">{selectedProduct.description || 'Описание не указано.'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
