import { useEffect, useState } from 'react'

import Alert from '../../../components/Alert'
import Button from '../../../components/Button'
import Input from '../../../components/Input'
import { getErrorMessage } from '../../../utils/errors'

import { companyService } from '../companyService'
import useAuth from '../../../hooks/useAuth'


const ROLES = [
  ['SUPER_ADMIN', 'Super Admin'],
  ['MANAGEMENT', 'Management'],
  ['HR_ADMINISTRATOR', 'HR Administrator'],
  ['HR_MANAGER', 'HR Manager'],
  ['DEPARTMENT_MANAGER', 'Department Manager'],
  ['STORES_MANAGER', 'Stores Manager'],
  ['STORES_USER', 'Stores User'],
  ['EMPLOYEE', 'Employee'],
  ['VIEWER', 'Viewer'],
]


const EMPLOYMENT_STATUS = [
  ['ACTIVE', 'Active'],
  ['ON_LEAVE', 'On Leave'],
  ['NOTICE_PERIOD', 'Notice Period'],
  ['INACTIVE', 'Inactive'],
  ['RESIGNED', 'Resigned'],
  ['TERMINATED', 'Terminated'],
]


const EMPTY_FORM = {
  username: '',
  password: '',
  first_name: '',
  last_name: '',
  email: '',
  role: 'EMPLOYEE',
  companies: [],
  department: '',
  employee_id: '',
  designation: '',
  phone: '',
  joining_date: '',
  employment_status: 'ACTIVE',
  can_access_common_inventory: true,
}


export default function UserAccessTab() {

  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [departments, setDepartments] = useState([])

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const [form, setForm] = useState(
    EMPTY_FORM
  )

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [search, setSearch] = useState('')


  /*
   * ========================================================
   * CURRENT LOGGED-IN USER
   * ========================================================
   */

  const {
    user: currentUser,
  } = useAuth()


  const currentRole =
    currentUser?.profile?.role


  /*
   * Only these users can change another
   * user's designation:
   *
   * 1. Super Admin
   * 2. HR Administrator
   * 3. HR Manager
   *
   * Because this screen is already scoped to the
   * active company, HR users are automatically
   * limited to their related company by the
   * companyService / active company scope.
   */

  const canEditDesignation =
    Boolean(
      currentUser?.is_superuser ||
      currentRole === 'SUPER_ADMIN' ||
      currentRole === 'HR_ADMINISTRATOR' ||
      currentRole === 'HR_MANAGER'
    )


  /*
   * Only Admin / Super Admin / related company HR
   * can permanently delete another user.
   */

  const canManageUserDeletion =
    Boolean(
      currentUser?.is_superuser ||
      currentRole === 'SUPER_ADMIN' ||
      currentRole === 'HR_ADMINISTRATOR' ||
      currentRole === 'HR_MANAGER'
    )


  /*
   * ========================================================
   * LOAD DATA
   * ========================================================
   */

  const loadData = async () => {

    setLoading(true)
    setError('')

    try {

      const [
        usersResponse,
        companiesResponse,
        departmentsResponse,
      ] = await Promise.all([

        companyService.getUsers(),

        companyService.getCompanies(),

        companyService.getDepartments(),

      ])


      const userData =
        Array.isArray(
          usersResponse.data
        )
          ? usersResponse.data
          : usersResponse.data?.results || []


      const companyData =
        Array.isArray(
          companiesResponse.data
        )
          ? companiesResponse.data
          : companiesResponse.data?.results || []


      const departmentData =
        Array.isArray(
          departmentsResponse.data
        )
          ? departmentsResponse.data
          : departmentsResponse.data?.results || []


      setUsers(
        userData
      )


      setCompanies(
        companyData.filter(
          (company) =>
            company.is_active
        )
      )


      setDepartments(
        departmentData.filter(
          (department) =>
            department.is_active
        )
      )


    } catch (err) {

      setError(
        getErrorMessage(err)
      )

    } finally {

      setLoading(false)

    }

  }


  useEffect(() => {

    loadData()

  }, [])


  /*
   * ========================================================
   * FORM HELPERS
   * ========================================================
   */

  const resetForm = () => {

    setForm({
      ...EMPTY_FORM,
    })

  }


  const closeModal = () => {

    setModalOpen(false)

    setSelectedUser(null)

    resetForm()

  }


  const openCreateUser = () => {

    setError('')

    setSelectedUser(null)

    setForm({
      ...EMPTY_FORM,
    })

    setModalOpen(true)

  }


  const openEditUser = (
    user
  ) => {

    setError('')

    setSelectedUser(
      user
    )


    setForm({

      username:
        user.username || '',

      password:
        '',

      first_name:
        user.first_name || '',

      last_name:
        user.last_name || '',

      email:
        user.email || '',

      role:
        user.role || 'EMPLOYEE',

      companies:
        Array.isArray(
          user.companies
        )
          ? user.companies.map(
              (company) =>
                typeof company ===
                'object'
                  ? company.id
                  : company
            )
          : [],

      department:
        user.department?.id ??
        user.department ??
        '',

      employee_id:
        user.employee_id || '',

      designation:
        user.designation || '',

      phone:
        user.phone || '',

      joining_date:
        user.joining_date || '',

      employment_status:
        user.employment_status ||
        'ACTIVE',

      can_access_common_inventory:
        Boolean(
          user.can_access_common_inventory
        ),

    })


    setModalOpen(true)

  }


  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target


    setForm(
      (current) => ({

        ...current,

        [name]:
          type === 'checkbox'
            ? checked
            : value,

      })
    )

  }


  const handleCompanyToggle = (
    companyId
  ) => {

    setForm(
      (current) => {

        const exists =
          current.companies.some(
            (id) =>
              Number(id) ===
              Number(companyId)
          )


        return {

          ...current,

          companies:
            exists
              ? current.companies.filter(
                  (id) =>
                    Number(id) !==
                    Number(companyId)
                )
              : [
                  ...current.companies,
                  companyId,
                ],

        }

      }
    )

  }


  /*
   * ========================================================
   * SAVE USER
   * ========================================================
   */

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault()

    setError('')

    setSaving(true)


    try {

      const payload = {

        username:
          form.username.trim(),

        first_name:
          form.first_name.trim(),

        last_name:
          form.last_name.trim(),

        email:
          form.email.trim(),

        role:
          form.role,

        companies:
          form.companies,

        department:
          form.department
            ? Number(
                form.department
              )
            : null,

        employee_id:
          form.employee_id.trim(),

        designation:
          form.designation.trim(),

        phone:
          form.phone.trim(),

        joining_date:
          form.joining_date,

        employment_status:
          form.employment_status,

        can_access_common_inventory:
          form.can_access_common_inventory,

      }


      /*
       * Designation is controlled by Admin / HR.
       * Do not allow unauthorized users to modify it.
       */

      if (
        selectedUser &&
        !canEditDesignation
      ) {

        payload.designation =
          selectedUser.designation ||
          ''

      }


      /*
       * CREATE USER
       */

      if (!selectedUser) {

        const password =
          form.password.trim()


        if (!password) {

          throw new Error(
            'Password is required when creating a user.'
          )

        }


        if (
          password.length < 8
        ) {

          throw new Error(
            'Password must contain at least 8 characters.'
          )

        }


        payload.password =
          password


        await companyService.createUser({

          ...payload,

          company:
            form.companies?.[0] ||
            null,

        })

      }


      /*
       * EDIT USER
       */

      else {

        /*
         * Password is optional while editing.
         * Blank means keep existing password.
         */

        if (
          form.password.trim()
        ) {

          if (
            form.password.trim().length <
            8
          ) {

            throw new Error(
              'New password must contain at least 8 characters.'
            )

          }


          payload.password =
            form.password.trim()

        }


        await companyService.updateUserAccess(

          selectedUser.id,

          payload

        )

      }


      /*
       * Close modal after successful save.
       */

      closeModal()


      /*
       * Reload users so the updated
       * information is immediately visible.
       */

      await loadData()


    } catch (err) {

      setError(
        getErrorMessage(err)
      )

    } finally {

      setSaving(false)

    }

  }


  /*
   * ========================================================
   * DELETE USER
   * ========================================================
   */

  const deleteUser = async (
    user
  ) => {

    if (!user) {
      return
    }


    /*
     * Never allow the logged-in user
     * to delete their own account.
     */

    if (
      currentUser?.id != null &&
      Number(user.id) ===
      Number(currentUser.id)
    ) {

      setError(
        'You cannot delete your own user account.'
      )

      return

    }


    /*
     * Only Admin / Super Admin / related HR
     * can permanently delete users.
     */

    if (!canManageUserDeletion) {

      setError(
        'Only Admin or the related company HR can delete users.'
      )

      return

    }


    /*
     * Permanent deletion confirmation.
     */

    const confirmed =
      window.confirm(
        `Delete ${user.username}? This will permanently remove the user account and cannot be undone.`
      )


    if (!confirmed) {
      return
    }


    setError('')


    try {

      await companyService.deleteUser(
        user.id
      )


      /*
       * Reload the user list after deletion.
       */

      await loadData()


    } catch (err) {

      setError(
        getErrorMessage(err)
      )

    }

  }


  /*
   * ========================================================
   * SEARCH
   * ========================================================
   */

  const filteredUsers =
    users.filter(
      (user) => {

        const query =
          search
            .trim()
            .toLowerCase()


        if (!query) {
          return true
        }


        return [

          user.username,

          user.first_name,

          user.last_name,

          user.email,

          user.employee_id,

          user.designation,

          user.role_label,

          user.department?.name,

        ]
          .filter(Boolean)
          .some(
            (value) =>
              String(value)
                .toLowerCase()
                .includes(query)
          )

      }
    )


  /*
   * ========================================================
   * RENDER
   * ========================================================
   */

  return (

    <div className="company-tab">


      {/* ====================================================
          HEADER
          ==================================================== */}

      <div className="company-tab-header">

        <div>

          <h2>
            User Management
          </h2>

          <p>
            Create, edit and manage
            users for the active company.
          </p>

        </div>


        <Button
          type="button"
          onClick={
            openCreateUser
          }
        >
          + Add user
        </Button>

      </div>


      {/* ====================================================
          ERROR
          ==================================================== */}

      {error && (

        <Alert
          type="error"
          message={error}
        />

      )}


      {/* ====================================================
          SEARCH
          ==================================================== */}

      <div className="company-toolbar">

        <Input
          label=""
          name="search"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search users..."
        />

      </div>


      {/* ====================================================
          USERS TABLE
          ==================================================== */}

      <div className="company-table-wrap">

        <table className="company-table">

          <thead>

            <tr>

              <th>
                User
              </th>

              <th>
                Employee ID
              </th>

              <th>
                Role
              </th>

              <th>
                Department
              </th>

              <th>
                Companies
              </th>

              <th>
                Status
              </th>

              <th>
                Inventory
              </th>

              <th>
                Actions
              </th>

            </tr>

          </thead>


          <tbody>

            {loading && (

              <tr>

                <td
                  colSpan="8"
                  className="company-empty"
                >
                  Loading users...
                </td>

              </tr>

            )}


            {!loading &&
              filteredUsers.map(
                (user) => (

                  <tr
                    key={
                      user.id
                    }
                  >

                    {/* USER */}

                    <td>

                      <div className="company-user">

                        <strong>

                          {[
                            user.first_name,
                            user.last_name,
                          ]
                            .filter(Boolean)
                            .join(' ') ||
                            user.username}

                        </strong>

                        <span>
                          {user.email ||
                            user.username}
                        </span>

                      </div>

                    </td>


                    {/* EMPLOYEE ID */}

                    <td>

                      {user.employee_id ||
                        '—'}

                    </td>


                    {/* ROLE */}

                    <td>

                      {user.role_label ||
                        user.role ||
                        '—'}

                    </td>


                    {/* DEPARTMENT */}

                    <td>

                      {user.department?.name ||
                        '—'}

                    </td>


                    {/* COMPANIES */}

                    <td>

                      <div className="company-badges">

                        {(
                          user.companies ||
                          []
                        ).map(
                          (company) => (

                            <span
                              key={
                                company.id ||
                                company
                              }
                              className="company-badge"
                            >

                              {
                                company.name ||
                                company
                              }

                            </span>

                          )
                        )}

                      </div>

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={
                          user.is_active
                            ? 'company-status active'
                            : 'company-status inactive'
                        }
                      >

                        {
                          user.is_active
                            ? 'Active'
                            : 'Inactive'
                        }

                      </span>

                    </td>


                    {/* INVENTORY */}

                    <td>

                      <span
                        className={
                          user.can_access_common_inventory
                            ? 'company-status active'
                            : 'company-status inactive'
                        }
                      >

                        {
                          user.can_access_common_inventory
                            ? 'Enabled'
                            : 'Disabled'
                        }

                      </span>

                    </td>


                    {/* ACTIONS */}

                    <td className="company-actions">

                      <button
                        type="button"
                        className="company-link"
                        onClick={() =>
                          openEditUser(
                            user
                          )
                        }
                      >
                        Edit
                      </button>


                      {canManageUserDeletion && (

                        <button
                          type="button"
                          className="company-link danger"
                          onClick={() =>
                            deleteUser(
                              user
                            )
                          }
                        >
                          Delete
                        </button>

                      )}

                    </td>

                  </tr>

                )
              )}


            {/* NO USERS */}

            {!loading &&
              filteredUsers.length ===
                0 && (

                <tr>

                  <td
                    colSpan="8"
                    className="company-empty"
                  >
                    No users found.
                  </td>

                </tr>

              )}

          </tbody>

        </table>

      </div>


      {/* ====================================================
          USER MODAL
          ==================================================== */}

      {modalOpen && (

        <div
          className="company-modal-backdrop"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeModal()

            }

          }}
        >

          <div
            className="company-modal"
            role="dialog"
            aria-modal="true"
          >


            {/* ==================================================
                MODAL HEADER
                ================================================== */}

            <div className="company-modal-header">

              <div>

                <h3>

                  {selectedUser
                    ? 'Edit User'
                    : 'Add User'}

                </h3>

                <p>

                  {selectedUser
                    ? 'Update user access and details.'
                    : 'Create a new user for the active company.'}

                </p>

              </div>


              <button
                type="button"
                className="company-modal-close"
                onClick={
                  closeModal
                }
              >
                ×
              </button>

            </div>


            {/* ==================================================
                FORM
                ================================================== */}

            <form
              className="company-form"
              onSubmit={
                handleSubmit
              }
            >


              {/* =================================================
                  ACCOUNT DETAILS
                  ================================================= */}

              <div className="company-form-section">

                <h4>
                  Account details
                </h4>


                <div className="company-form-grid">


                  <Input
                    label="Username"
                    name="username"
                    value={
                      form.username
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />


                  <Input
                    label={
                      selectedUser
                        ? 'New Password'
                        : 'Temporary Password'
                    }
                    name="password"
                    type="password"
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    required={
                      !selectedUser
                    }
                    minLength="8"
                    placeholder={
                      selectedUser
                        ? 'Leave blank to keep current password'
                        : 'Minimum 8 characters'
                    }
                  />


                  <Input
                    label="First Name"
                    name="first_name"
                    value={
                      form.first_name
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />


                  <Input
                    label="Last Name"
                    name="last_name"
                    value={
                      form.last_name
                    }
                    onChange={
                      handleChange
                    }
                  />


                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                  />


                  <Input
                    label="Phone"
                    name="phone"
                    value={
                      form.phone
                    }
                    onChange={
                      handleChange
                    }
                  />


                  <Input
                    label="Employee ID"
                    name="employee_id"
                    value={
                      form.employee_id
                    }
                    onChange={
                      handleChange
                    }
                  />


                  <Input
                    label="Joining Date"
                    name="joining_date"
                    type="date"
                    value={
                      form.joining_date
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>


              {/* =================================================
                  ACCESS
                  ================================================= */}

              <div className="company-form-section">

                <h4>
                  Access
                </h4>


                <div className="company-form-grid">


                  <div className="company-field">

                    <label>
                      Role
                    </label>

                    <select
                      name="role"
                      value={
                        form.role
                      }
                      onChange={
                        handleChange
                      }
                      className="company-input"
                      required
                    >

                      {ROLES.map(
                        ([value, label]) => (

                          <option
                            key={
                              value
                            }
                            value={
                              value
                            }
                          >
                            {label}
                          </option>

                        )
                      )}

                    </select>

                  </div>


                  <div className="company-field">

                    <label>
                      Employment Status
                    </label>

                    <select
                      name="employment_status"
                      value={
                        form.employment_status
                      }
                      onChange={
                        handleChange
                      }
                      className="company-input"
                    >

                      {EMPLOYMENT_STATUS.map(
                        ([value, label]) => (

                          <option
                            key={
                              value
                            }
                            value={
                              value
                            }
                          >
                            {label}
                          </option>

                        )
                      )}

                    </select>

                  </div>


                  <div className="company-field">

                    <label>
                      Department
                    </label>

                    <select
                      name="department"
                      value={
                        form.department
                      }
                      onChange={
                        handleChange
                      }
                      className="company-input"
                    >

                      <option value="">
                        Select department
                      </option>

                      {departments.map(
                        (department) => (

                          <option
                            key={
                              department.id
                            }
                            value={
                              department.id
                            }
                          >

                            {
                              department.name
                            }

                          </option>

                        )
                      )}

                    </select>

                  </div>


                  <Input
                    label="Designation"
                    name="designation"
                    value={
                      form.designation
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      !canEditDesignation
                    }
                  />


                  {!canEditDesignation && (

                    <p className="user-admin-help">

                      Only Admin or the related
                      company HR can change
                      designation.

                    </p>

                  )}

                </div>

              </div>


              {/* =================================================
                  COMPANY ASSIGNMENT
                  ================================================= */}

              <div className="company-form-section">

                <h4>
                  Company Assignment
                </h4>


                <p className="company-form-help">

                  Non-Super Admin users are restricted
                  to the active company.

                </p>


                <div className="company-check-list">

                  {companies.map(
                    (company) => {

                      const checked =
                        form.companies.some(
                          (id) =>
                            Number(id) ===
                            Number(company.id)
                        )


                      const isSuperAdmin =
                        form.role ===
                        'SUPER_ADMIN'


                      return (

                        <label
                          key={
                            company.id
                          }
                          className="company-check-item"
                        >

                          <input
                            type="checkbox"
                            checked={
                              isSuperAdmin
                                ? true
                                : checked
                            }
                            disabled={
                              isSuperAdmin
                            }
                            onChange={() =>
                              handleCompanyToggle(
                                company.id
                              )
                            }
                          />

                          <span>
                            {
                              company.name
                            }
                          </span>

                        </label>

                      )

                    }
                  )}

                </div>

              </div>


              {/* =================================================
                  COMMON INVENTORY
                  ================================================= */}

              <div className="company-form-section">

                <h4>
                  Common Inventory
                </h4>


                <label className="company-check-item">

                  <input
                    type="checkbox"
                    name="can_access_common_inventory"
                    checked={
                      form.can_access_common_inventory
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <span>
                    Allow access to Common Inventory
                  </span>

                </label>

              </div>


              {/* =================================================
                  FORM ACTIONS
                  ================================================= */}

              <div className="company-modal-actions">

                <Button
                  type="button"
                  variant="secondary"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </Button>


                <Button
                  type="submit"
                  disabled={
                    saving
                  }
                >

                  {saving
                    ? 'Saving...'
                    : selectedUser
                      ? 'Save changes'
                      : 'Create user'}

                </Button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  )

}