import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { usePet } from "../hooks/usePets";
import { updatePet, deletePet } from "../store/pets/petsSlice";
import { pushNotice } from "../store/notices/noticesSlice";
import { STATUSES } from "../constants";
import { show, formatDate, formatAge } from "../utils/format";
import StatusMessage from "../components/StatusMessage";
import PetForm from "../components/PetForm";

const ACTION_LABEL = { Available: "Make available", Reserved: "Reserve", Adopted: "Mark as adopted" };

// /pets/:id. The key makes React start a fresh PetDetails whenever the id in the URL changes,
// so nothing (form, notice, confirm button) is carried over from the previous pet.
export default function PetDetailsPage() {
  const { id } = useParams();
  return <PetDetails key={id} id={id} />;
}

function PetDetails({ id }) {
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useDispatch();
  const pet = usePet(id);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [formError, setFormError] = useState("");
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const goBack = () => (location.key === "default" ? navigate("/pets") : navigate(-1));

  const backLinks = (
    <div className="actions">
      <button onClick={goBack}>← Back</button>
      <Link className="button" to="/pets">
        All pets
      </Link>
    </div>
  );

  if (!pet.pet && pet.status !== "failed") {
    return (
      <div className="stack">
        {backLinks}
        <StatusMessage kind="loading" message="Loading profile…" />
      </div>
    );
  }

  if (!pet.pet) {
    const missing = pet.error === "Item not found";
    return (
      <div className="stack">
        {backLinks}
        {missing ? (
          <StatusMessage kind="empty" message={`There is no pet with the id "${id}". It may have been removed.`} />
        ) : (
          <StatusMessage kind="error" message={`Could not load this pet: ${pet.error}`} action={{ label: "Try again", onClick: pet.reload }} />
        )}
      </div>
    );
  }

  const item = pet.pet;
  const facts = [
    ["Species", item.species],
    ["Breed", item.breed],
    ["Age", item.age === undefined ? undefined : formatAge(item.age)],
    ["Size", item.size],
    ["Temperament", item.temperament],
    ["Vaccinated", item.vaccinated === undefined ? undefined : item.vaccinated ? "Yes" : "No"],
    ["Shelter", item.location],
    ["Arrived", formatDate(item.arrivedOn)],
  ];

  // The success messages come from the store (noticesSlice); only the errors are written here.
  async function changeStatus(status) {
    setBusy(true);
    try {
      await dispatch(updatePet({ id: item.id, changes: { status } })).unwrap();
    } catch (err) {
      if (mounted.current) dispatch(pushNotice("error", `Could not update ${item.name}: ${err.message}`));
    } finally {
      if (mounted.current) setBusy(false);
    }
  }

  async function savePet(values) {
    setSaving(true);
    setFormError("");
    try {
      await dispatch(updatePet({ id: item.id, changes: values })).unwrap();
      if (!mounted.current) return;
      setEditing(false);
    } catch (err) {
      if (mounted.current) setFormError(err.message);
    } finally {
      if (mounted.current) setSaving(false);
    }
  }

  async function remove() {
    setBusy(true);
    setConfirming(false);
    try {
      await dispatch(deletePet({ id: item.id, name: item.name })).unwrap();
      // Going to the list is correct even if the user already left: the pet is gone.
      navigate("/pets", { replace: true });
    } catch (err) {
      if (mounted.current) {
        dispatch(pushNotice("error", `Could not remove ${item.name}: ${err.message}`));
        setBusy(false);
      }
    }
  }

  return (
    <div className="stack">
      {backLinks}

      {editing ? (
        <PetForm mode="edit" pet={item} saving={saving} error={formError} onSubmit={savePet} onCancel={() => setEditing(false)} />
      ) : (
        <article className="panel">
          <div className="panel-head">
            <h1>{item.name}</h1>
            <span className={`badge ${(item.status || "unknown").toLowerCase()}`}>{item.status || "Unknown"}</span>
          </div>
          <p className="lead">{item.description}</p>

          <dl className="facts">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{show(value)}</dd>
              </div>
            ))}
          </dl>

          {busy && (
            <p className="busy" role="status">
              Saving changes…
            </p>
          )}

          <div className="actions">
            {STATUSES.filter((s) => s !== item.status).map((s) => (
              <button key={s} className={s === "Adopted" ? "primary" : ""} disabled={busy} onClick={() => changeStatus(s)}>
                {ACTION_LABEL[s]}
              </button>
            ))}
          </div>

          <div className="actions">
            <button disabled={busy} onClick={() => setEditing(true)}>
              Edit
            </button>
            {confirming ? (
              <>
                <button className="danger" disabled={busy} onClick={remove}>
                  Yes, remove {item.name}
                </button>
                <button onClick={() => setConfirming(false)}>Keep</button>
              </>
            ) : (
              <button className="danger" disabled={busy} onClick={() => setConfirming(true)}>
                Remove
              </button>
            )}
          </div>
        </article>
      )}
    </div>
  );
}
