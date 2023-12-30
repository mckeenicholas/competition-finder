import { Tooltip } from "@mui/joy";
import "flag-icons/css/flag-icons.min.css";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export const FlagIcon: React.FC<{
  code: string;
}> = (props) => {
  const { code } = props;

  return (
    <Tooltip title={regionNames.of(code)} variant="outlined">
      <span className={`fi fi-${code.toLocaleLowerCase()} `}></span>
    </Tooltip>
  );
};
