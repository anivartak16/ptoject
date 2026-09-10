import React from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Card } from "../components/common/Card.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";
import { MatchesPage } from "./MatchesPage.jsx";
import { FpoAggregationPage } from "./FpoAggregationPage.jsx";

export function DynamicPage() {
  const { misc, r } = useParams();
  const { user } = useAuth();

  if (misc === "profile") {
    return (
      <section>
        <p className="eyebrow">ACCOUNT</p>
        <h1>My profile</h1>
        <div className="two-col">
          <div className="panel">
            <h3>{user?.name}</h3>
            <p>
              <b>Role:</b> {user?.role}
            </p>
            <p>
              <b>Email:</b> {user?.email}
            </p>
            <p>
              <b>Location:</b> {user?.location || "Not provided"}
            </p>
            <StatusBadge>{user?.verification || "PENDING VERIFICATION"}</StatusBadge>
          </div>
          <div className="panel">
            <h3>Trust status</h3>
            <p>
              Your verified profile helps buyers and partners make confident
              decisions.
            </p>
            <Link className="primary" to={"/" + r + "/notifications"}>
              View notifications
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (misc === "farm") {
    return (
      <section>
        <p className="eyebrow">FARM MANAGEMENT</p>
        <h1>My farm</h1>
        <div className="grid">
          <Card
            a="PRIMARY LOCATION"
            b={user?.location || "Indore"}
            c="Update through your profile"
          />
          <Card a="ACTIVE PRODUCE" b="Wheat" c="Grade A quality records" />
          <Card
            a="AVAILABLE LOTS"
            b="View lots"
            c="Create and manage inventory"
          />
        </div>
        <div className="panel">
          <h3>Farm inventory</h3>
          <p>
            Lot quantity, harvest date, quality and availability are managed
            from My Lots so every buyer sees consistent information.
          </p>
          <Link className="primary" to={"/" + r + "/lots"}>
            Manage farm lots
          </Link>
        </div>
      </section>
    );
  }

  if (misc === "recommendations" || misc === "matching") {
    return <MatchesPage />;
  }

  if (misc === "farmers") {
    return <FpoAggregationPage />;
  }

  return (
    <section>
      <p className="eyebrow">WORKSPACE</p>
      <h1>{misc ? misc.replaceAll("-", " ") : "Workspace"}</h1>
      <div className="panel">
        <h3>This module is ready</h3>
        <p>
          Use the navigation to access the connected marketplace workflows:
          lots, demands, market prices, offers and transactions.
        </p>
        <Link className="primary" to={"/" + r + "/dashboard"}>
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}

export default DynamicPage;
