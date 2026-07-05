import styles from "./company-avatar.module.css";

export type CompanyAvatarProps = {
  initials: string;
  backgroundColor: string;
  textColor: string;
};

export function CompanyAvatar({ initials, backgroundColor, textColor }: CompanyAvatarProps) {
  return (
    <div className={styles.avatar} style={{ backgroundColor, color: textColor }}>
      {initials}
    </div>
  );
}
