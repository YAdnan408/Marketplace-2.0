import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile, uploadProfileImage } from "../api/auth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Spinner from "../components/ui/Spinner";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSeller = user?.user_type === "seller";

  const [profile, setProfile]   = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm]         = useState({ name: "", phone_number: "", address: "" });
  const [success, setSuccess]   = useState("");
  const [error, setError]       = useState("");
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    getProfile().then((p) => {
      setProfile(p);
      setForm({ name: p.name, phone_number: p.phone_number || "", address: p.address || "" });
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await updateProfile(form);
      setProfile(res.profile);
      setSuccess("Profile updated successfully.");
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Update failed.");
    } finally { setSaving(false); }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadProfileImage(file);
      setProfile((prev) => ({ ...prev, profile_image: res.profile_image }));
    } catch {
      setError("Image upload failed.");
    }
  };

  const backTo = isSeller ? "/seller/dashboard" : "/customer/dashboard";

  if (!profile) return <><Navbar backTo={backTo} backLabel="← Back to Dashboard" /><div style={{padding:"60px",textAlign:"center"}}>Loading…</div></>;

  return (
    <>
      <Navbar backTo={backTo} backLabel="← Back to Dashboard" />

      <div className="profile-container">
        {/* Left: Avatar */}
        <div className="profile-left">
          <div className="avatar-wrapper">
            <img
              className="avatar-img"
              src={profile.profile_image ? `/uploads/profile_images/${profile.profile_image}` : "/uploads/profile_images/default_avatar.png"}
              alt="Profile"
            />
            <label className="avatar-upload-btn" title="Change photo" htmlFor="imageInput">📷</label>
            <input id="imageInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
          </div>
          <h3 className="profile-display-name">{profile.name}</h3>
          <p className="profile-display-email">{profile.email}</p>
          <span className="profile-badge">{profile.user_type}</span>
        </div>

        {/* Right: Details */}
        <div className="profile-right">
          <div className="profile-section-header">
            <h2>Profile Details</h2>
            {!editMode && <button className="btn-edit-profile" onClick={() => setEditMode(true)}>Edit Profile</button>}
          </div>

          {success && <div className="success-msg">{success}</div>}
          {error   && <div className="error-msg">{error}</div>}

          {!editMode ? (
            <div>
              {[
                ["Full Name",    profile.name],
                ["Email",        profile.email],
                ["Phone",        profile.phone_number || "—"],
                [isSeller ? "Business Address" : "Address", profile.address || "—"],
              ].map(([label, val]) => (
                <div className="info-row" key={label}>
                  <span className="info-label">{label}</span>
                  <span className="info-value">{val}</span>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <div className="field-group">
                <label>Full Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field-group">
                <label>Phone Number</label>
                <input type="text" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
              </div>
              <div className="field-group">
                <label>{isSeller ? "Business Address" : "Address"}</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="edit-actions">
                <button type="submit" className="btn-primary btn-save" disabled={saving}>
                  {saving ? <Spinner /> : "Save Changes"}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}