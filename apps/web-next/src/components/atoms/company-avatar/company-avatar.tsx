import styles from "./company-avatar.module.css";

export type CompanyAvatarProps = {
  initials: string;
  backgroundColor: string;
  textColor: string;
  shape?: "square" | "circle";
  size?: "sm" | "lg";
};

export function CompanyAvatar({
  initials,
  backgroundColor,
  textColor,
  shape = "square",
  size = "sm",
}: CompanyAvatarProps) {
  const classes = [styles.avatar, size === "lg" ? styles.lg : undefined, shape === "circle" ? styles.circle : undefined]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={{ backgroundColor, color: textColor }}>
      {initials}
    </div>
  );
}
