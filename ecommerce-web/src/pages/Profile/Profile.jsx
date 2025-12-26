import React, { useEffect, useMemo, useState } from 'react';
import './Profile.css';
import { useDispatch, useSelector } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { MdEdit, MdEmail, MdPhone, MdWork, MdPerson } from 'react-icons/md';
import { authService } from '../../services/api';
import { showToast } from '../../utils/Toast';
import { updateUser } from '../../store/slices/authSlice';

const getInitials = (name) => {
  const safe = String(name || '').trim();
  if (!safe) return 'U';
  const parts = safe.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || 'U';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return (first + last).toUpperCase();
};

const Profile = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);

  const [profile, setProfile] = useState(authUser);
  const [loading, setLoading] = useState(true);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const avatarText = useMemo(() => getInitials(profile?.fullName), [profile?.fullName]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const res = await authService.getProfile();
        const nextUser = res?.user || res?.data?.user || res?.userData || null;
        if (mounted && nextUser) setProfile(nextUser);
      } catch (e) {
        if (mounted) {
          setProfile(authUser);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [authUser]);

  const openEditDialog = () => {
    setNameDraft(String(profile?.fullName || ''));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleSaveName = () => {
    const nextName = String(nameDraft || '').trim();
    if (!nextName) {
      showToast.error('Please enter your name');
      return;
    }

    setProfile((prev) => ({ ...(prev || {}), fullName: nextName }));
    dispatch(updateUser({ fullName: nextName }));
    showToast.success('Name updated');
  };

  const handleChangePassword = () => {
    const current = String(currentPassword || '');
    const next = String(newPassword || '');
    const confirm = String(confirmPassword || '');

    if (!current || !next || !confirm) {
      showToast.error('Please fill all password fields');
      return;
    }

    if (next.length < 8) {
      showToast.error('New password must be at least 8 characters');
      return;
    }

    if (next !== confirm) {
      showToast.error('New password and confirm password do not match');
      return;
    }

    showToast.success('Password changed (demo)');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="profile-page">
      

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-card-left">
            <div className="profile-avatar">
              {profile?.profileImage ? (
                <img src={profile.profileImage} alt="avatar" className="profile-avatar-img" />
              ) : (
                <span className="profile-avatar-text">{avatarText}</span>
              )}
            </div>
          </div>

          <div className="profile-card-right">
            <div className="profile-name-row">
              <div className="profile-name">{profile?.fullName || 'User name'}</div>
              <div className="profile-badge" />
            </div>
            <div className="profile-sub">{profile?.email || profile?.phone || ''}</div>

            <div className="profile-metrics">
              <div className="profile-metric">
                <span className="profile-metric-label">Profession</span>
                <span className="profile-metric-value">{profile?.profession || 'Not set'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="profile-card-edit"
            onClick={openEditDialog}
            aria-label="edit profile"
          >
            <MdEdit size={18} />
          </button>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Contact details</div>

          <div className="profile-list">
            <div className="profile-row">
              <div className="profile-row-icon"><MdPerson size={20} /></div>
              <div className="profile-row-body">
                <div className="profile-row-label">Full name</div>
                <div className="profile-row-value">{profile?.fullName || '-'}</div>
              </div>
              <div className="profile-row-action" />
            </div>

            <div className="profile-row">
              <div className="profile-row-icon"><MdEmail size={20} /></div>
              <div className="profile-row-body">
                <div className="profile-row-label">Email address</div>
                <div className="profile-row-value">{profile?.email || '-'}</div>
              </div>
              <div className="profile-row-action" />
            </div>

            <div className="profile-row">
              <div className="profile-row-icon"><MdPhone size={20} /></div>
              <div className="profile-row-body">
                <div className="profile-row-label">Phone number</div>
                <div className="profile-row-value">{profile?.phone ? `+91 ${profile.phone}` : '-'}</div>
              </div>
              <div className="profile-row-action" />
            </div>

            <div className="profile-row">
              <div className="profile-row-icon"><MdWork size={20} /></div>
              <div className="profile-row-body">
                <div className="profile-row-label">Profession</div>
                <div className="profile-row-value">{profile?.profession || '-'}</div>
              </div>
              <button type="button" className="profile-row-edit" onClick={openEditDialog}>
                <MdEdit size={18} />
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="profile-loading">
            <CircularProgress size={28} />
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onClose={closeEditDialog} fullWidth maxWidth="xs">
        <DialogTitle>Edit profile</DialogTitle>
        <DialogContent>
          <div className="profile-dialog-content">
            <div className="profile-edit-section">
              <div className="profile-edit-section-title">Profile name</div>
              <TextField
                label="Full name"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                fullWidth
              />
              <div className="profile-edit-actions">
                <Button variant="contained" onClick={handleSaveName}>Save name</Button>
              </div>
            </div>

            <div className="profile-edit-divider" />

            <div className="profile-edit-section">
              <div className="profile-edit-section-title">Change password</div>
              <TextField
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
              />
              <TextField
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
              />
              <TextField
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
              />
              <div className="profile-edit-actions">
                <Button variant="contained" onClick={handleChangePassword}>Change password</Button>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Profile;
