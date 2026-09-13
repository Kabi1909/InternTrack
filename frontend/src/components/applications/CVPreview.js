import { Button } from '../common/UI.js';
import { downloadCV } from '../../services/uploadService.js';
import { useAction } from '../../hooks/useAction.js';
export default function CVPreview({ application }) {
  const { loading, run } = useAction();
  return (
    <Button
      variant="secondary"
      loading={loading}
      disabled={!application.cvUrl}
      onClick={() =>
        run(() => downloadCV(application.cvUrl, application.cv), 'CV downloaded')
      }
    >
      Download submitted CV
    </Button>
  );
}
