import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ActivatePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const res = await axios.get(`https://reactnative-etala.vercel.app/api/auth/activate/${token}`);
        toast.success(res.data.msg);
        navigate("/login");
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.msg || "Activation failed");
        navigate("/signup"); // fallback
      } finally {
        setLoading(false);
      }
    };
    activateAccount();
  }, [token]);

  if (loading) return <p>Activating your account...</p>;
  return null;
};

export default ActivatePage;
