import styles from "./company-avatar.module.css";

export type CompanyAvatarProps = {
  initials: string;
  backgroundColor: string;
  textColor: string;
  shape?: "square" | "circle";
};

export function CompanyAvatar({ initials, backgroundColor, textColor, shape = "square" }: CompanyAvatarProps) {
  const classes = [styles.avatar, shape === "circle" ? styles.circle : undefined].filter(Boolean).join(" ");

  return (
    <div className={classes} style={{ backgroundColor, color: textColor }}>
      {initials}
    </div>
  );
}
