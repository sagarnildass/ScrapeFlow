import React from 'react'

function ExecutionViewerPage({ params }: { params: { workflowId: string, executionId: string } }) {

  return (
    <div>
      Run Viewer {params.executionId}
    </div>
  )
}

export default ExecutionViewerPage
