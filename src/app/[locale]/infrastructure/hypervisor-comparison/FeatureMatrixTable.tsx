import { Check, X } from "lucide-react";

interface FeatureMatrixTableProps {
  features: {
    hypervisors: Array<{
      id: string;
      name: string;
      version: string;
      vendor: string;
      features: {
        highAvailability: {
          supported: boolean;
          modes: string[];
          failoverTime: string;
          notes: string;
        };
        liveMigration: {
          supported: boolean;
          technology: string;
          crossHost: boolean;
          crossDatacenter: boolean;
          notes: string;
        };
        storage: {
          types: string[];
          thinProvisioning: boolean;
          deduplication: boolean;
          compression: boolean;
          snapshots: boolean;
          replication: string;
          notes: string;
        };
        networking: {
          virtualSwitch: string;
          sdn: string;
          networkVirtualization: boolean;
          microSegmentation: boolean;
          notes: string;
        };
        backup: {
          api: string;
          cbbt: boolean;
          agentless: boolean;
          notes: string;
        };
        automation: {
          api: string;
          cli: string;
          terraform: boolean;
          ansible: boolean;
          notes: string;
        };
        security: {
          encryption: string;
          secureboot: boolean;
          tpm: boolean;
          notes: string;
        };
        monitoring: {
          builtin: string;
          metrics: string;
          logging: string;
          notes: string;
        };
        scalability: {
          maxHostsPerCluster: number;
          maxVmsPerHost: number;
          maxVmsPerCluster: number;
          notes: string;
        };
        licensing: {
          model: string;
          editions: string[];
          notes: string;
        };
      };
      pros: string[];
      cons: string[];
    }>;
  };
}

export function FeatureMatrixTable({ features }: FeatureMatrixTableProps) {
  const hypervisors = features.hypervisors;

  const renderBooleanIcon = (value: boolean) => {
    return value ? (
      <Check className="h-5 w-5 text-green-600" />
    ) : (
      <X className="h-5 w-5 text-red-600" />
    );
  };

  return (
    <div className="space-y-8">
      {/* High Availability */}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3">High Availability</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border p-2 text-left font-medium">Feature</th>
              {hypervisors.map((h) => (
                <th key={h.id} className="border p-2 text-left font-medium">
                  {h.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 font-medium">Supported</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2 text-center">
                  {renderBooleanIcon(h.features.highAvailability.supported)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 font-medium">HA Modes</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2">
                  {h.features.highAvailability.modes.join(", ")}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 font-medium">Failover Time</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2">
                  {h.features.highAvailability.failoverTime}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Live Migration */}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3">Live Migration</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border p-2 text-left font-medium">Feature</th>
              {hypervisors.map((h) => (
                <th key={h.id} className="border p-2 text-left font-medium">
                  {h.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 font-medium">Technology</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2">
                  {h.features.liveMigration.technology}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 font-medium">Cross-Host</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2 text-center">
                  {renderBooleanIcon(h.features.liveMigration.crossHost)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 font-medium">Cross-Datacenter</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2 text-center">
                  {renderBooleanIcon(h.features.liveMigration.crossDatacenter)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Storage */}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3">Storage</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border p-2 text-left font-medium">Feature</th>
              {hypervisors.map((h) => (
                <th key={h.id} className="border p-2 text-left font-medium">
                  {h.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 font-medium">Storage Types</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2 text-xs">
                  {h.features.storage.types.join(", ")}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 font-medium">Thin Provisioning</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2 text-center">
                  {renderBooleanIcon(h.features.storage.thinProvisioning)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 font-medium">Deduplication</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2 text-center">
                  {renderBooleanIcon(h.features.storage.deduplication)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 font-medium">Compression</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2 text-center">
                  {renderBooleanIcon(h.features.storage.compression)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 font-medium">Replication</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2">
                  {h.features.storage.replication}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Automation */}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3">Automation</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border p-2 text-left font-medium">Feature</th>
              {hypervisors.map((h) => (
                <th key={h.id} className="border p-2 text-left font-medium">
                  {h.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 font-medium">API</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2">
                  {h.features.automation.api}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 font-medium">CLI</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2">
                  {h.features.automation.cli}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 font-medium">Terraform</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2 text-center">
                  {renderBooleanIcon(h.features.automation.terraform)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 font-medium">Ansible</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2 text-center">
                  {renderBooleanIcon(h.features.automation.ansible)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Scalability */}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3">Scalability</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border p-2 text-left font-medium">Limit</th>
              {hypervisors.map((h) => (
                <th key={h.id} className="border p-2 text-left font-medium">
                  {h.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 font-medium">Max Hosts/Cluster</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2">
                  {h.features.scalability.maxHostsPerCluster}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 font-medium">Max VMs/Host</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2">
                  {h.features.scalability.maxVmsPerHost}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 font-medium">Max VMs/Cluster</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2">
                  {h.features.scalability.maxVmsPerCluster.toLocaleString()}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Licensing */}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3">Licensing</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border p-2 text-left font-medium">Aspect</th>
              {hypervisors.map((h) => (
                <th key={h.id} className="border p-2 text-left font-medium">
                  {h.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 font-medium">Model</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2">
                  {h.features.licensing.model}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 font-medium">Editions</td>
              {hypervisors.map((h) => (
                <td key={h.id} className="border p-2 text-xs">
                  {h.features.licensing.editions.join(", ")}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pros/Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hypervisors.map((h) => (
          <div key={h.id} className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">{h.name}</h4>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Pros:</p>
                <ul className="text-sm space-y-1">
                  {h.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-red-700 mb-1">Cons:</p>
                <ul className="text-sm space-y-1">
                  {h.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <X className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
