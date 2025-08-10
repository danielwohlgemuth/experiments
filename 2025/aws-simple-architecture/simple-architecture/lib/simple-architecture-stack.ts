import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

export class SimpleArchitectureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // CloudFormation parameters for URL and sleep time
    const urlParam = new cdk.CfnParameter(this, 'WebsocketCounterUrl', {
      type: 'String',
      default: 'https://websocket-counter.daniel-wohlgemuth.workers.dev/api/update?text=',
      description: 'The URL to call from the private instance script.'
    });
    const sleepParam = new cdk.CfnParameter(this, 'WebsocketCounterSleep', {
      type: 'Number',
      default: 3,
      description: 'The sleep interval (in seconds) between calls.'
    });

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'VPC', {
      // ipProtocol: ec2.IpProtocol.DUAL_STACK,
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          mapPublicIpOnLaunch: true,
          // ipv6AssignAddressOnCreation: true,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Create Network ACL for public subnet (multi-purpose instance)
    const publicInstanceNACL = new ec2.CfnNetworkAcl(this, 'PublicInstanceNACL', {
      vpcId: vpc.vpcId,
      tags: [{ key: 'Name', value: 'public-instance-nacl' }]
    });

    // Inbound rules for public instance
    new ec2.CfnNetworkAclEntry(this, 'PublicInboundResponse', {
      networkAclId: publicInstanceNACL.ref,
      ruleNumber: 100,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: false,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 1024,
        to: 65535,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PublicInboundHttp', {
      networkAclId: publicInstanceNACL.ref,
      ruleNumber: 200,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: false,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 80,
        to: 80,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PublicInboundHttps', {
      networkAclId: publicInstanceNACL.ref,
      ruleNumber: 300,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: false,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 443,
        to: 443,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PublicInboundSsh', {
      networkAclId: publicInstanceNACL.ref,
      ruleNumber: 400,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: false,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 22,
        to: 22,
      },
    });

    // Outbound rules for public instance
    new ec2.CfnNetworkAclEntry(this, 'PublicOutboundResponse', {
      networkAclId: publicInstanceNACL.ref,
      ruleNumber: 100,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 1024,
        to: 65535,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PublicOutboundHttp', {
      networkAclId: publicInstanceNACL.ref,
      ruleNumber: 200,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 80,
        to: 80,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PublicOutboundHttps', {
      networkAclId: publicInstanceNACL.ref,
      ruleNumber: 300,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 443,
        to: 443,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PublicOutboundSsh', {
      networkAclId: publicInstanceNACL.ref,
      ruleNumber: 400,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 22,
        to: 22,
      },
    });

    // Associate the NACL to the public subnet
    new ec2.CfnSubnetNetworkAclAssociation(this, 'PublicInstanceNACLAssociation', {
      subnetId: vpc.publicSubnets[0].subnetId,
      networkAclId: publicInstanceNACL.ref,
    });

    // Create Network ACL for private subnet
    const privateInstanceNACL = new ec2.CfnNetworkAcl(this, 'PrivateInstanceNACL', {
      vpcId: vpc.vpcId,
      tags: [{ key: 'Name', value: 'private-instance-nacl' }]
    });

    // Inbound rules for private instance
    new ec2.CfnNetworkAclEntry(this, 'PrivateInboundResponse', {
      networkAclId: privateInstanceNACL.ref,
      ruleNumber: 100,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: false,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 1024,
        to: 65535,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PrivateInboundHttp', {
      networkAclId: privateInstanceNACL.ref,
      ruleNumber: 200,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: false,
      cidrBlock: vpc.publicSubnets[0].ipv4CidrBlock,
      portRange: {
        from: 80,
        to: 80,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PrivateInboundSsh', {
      networkAclId: privateInstanceNACL.ref,
      ruleNumber: 300,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: false,
      cidrBlock: vpc.publicSubnets[0].ipv4CidrBlock,
      portRange: {
        from: 22,
        to: 22,
      },
    });

    // Outbound rules for private instance
    new ec2.CfnNetworkAclEntry(this, 'PrivateOutboundResponse', {
      networkAclId: privateInstanceNACL.ref,
      ruleNumber: 100,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 1024,
        to: 65535,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PrivateOutboundHttp', {
      networkAclId: privateInstanceNACL.ref,
      ruleNumber: 200,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 80,
        to: 80,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PrivateOutboundHttps', {
      networkAclId: privateInstanceNACL.ref,
      ruleNumber: 300,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 443,
        to: 443,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PrivateOutboundSsh', {
      networkAclId: privateInstanceNACL.ref,
      ruleNumber: 400,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 22,
        to: 22,
      },
    });

    // Associate the NACL to the private subnet
    new ec2.CfnSubnetNetworkAclAssociation(this, 'PrivateInstanceNACLAssociation', {
      subnetId: vpc.isolatedSubnets[0].subnetId,
      networkAclId: privateInstanceNACL.ref,
    });

    // Create IAM role for the public instance with granular permissions
    const publicInstanceRole = new iam.Role(this, 'PublicInstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    // Create custom policy for public instance to describe instances
    const publicInstancePolicy = new iam.Policy(this, 'PublicInstancePolicy', {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'ec2:DescribeInstances'
          ],
          resources: ['*']
        })
      ]
    });

    publicInstancePolicy.attachToRole(publicInstanceRole);

    // Create IAM role for the private instance (minimal permissions)
    const privateInstanceRole = new iam.Role(this, 'PrivateInstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    const keyPair = ec2.KeyPair.fromKeyPairName(this, 'KeyPair', 'aws-simple-architecture-key-pair');

    // Create a security group for the public instance
    const publicInstanceSecurityGroup = new ec2.SecurityGroup(this, 'PublicInstanceSecurityGroup', {
      allowAllOutbound: true,
      description: 'Security group for public multi-purpose instance',
      securityGroupName: 'public-instance-security-group',
      vpc: vpc,
    });

    // Allow HTTP, HTTPS, and SSH traffic from anywhere
    publicInstanceSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic from anywhere',
    );
    publicInstanceSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic from anywhere',
    );
    publicInstanceSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH traffic from anywhere',
    );

    // Create a security group for the private instance
    const privateInstanceSecurityGroup = new ec2.SecurityGroup(this, 'PrivateInstanceSecurityGroup', {
      allowAllOutbound: false,
      description: 'Security group for private instance',
      securityGroupName: 'private-instance-security-group',
      vpc: vpc,
    });

    // Allow HTTP, HTTPS, and SSH outbound traffic to the public instance
    privateInstanceSecurityGroup.addEgressRule(
      publicInstanceSecurityGroup,
      ec2.Port.tcp(80),
      'Allow HTTP traffic to public instance',
    );
    privateInstanceSecurityGroup.addEgressRule(
      publicInstanceSecurityGroup,
      ec2.Port.tcp(443),
      'Allow HTTPS traffic to public instance',
    );
    privateInstanceSecurityGroup.addEgressRule(
      publicInstanceSecurityGroup,
      ec2.Port.tcp(22),
      'Allow SSH traffic to public instance',
    );

    // Allow HTTP traffic from public instance only
    privateInstanceSecurityGroup.addIngressRule(
      publicInstanceSecurityGroup,
      ec2.Port.tcp(80),
      'Allow HTTP traffic from public instance only',
    );

    // Allow SSH traffic from public instance only
    privateInstanceSecurityGroup.addIngressRule(
      publicInstanceSecurityGroup,
      ec2.Port.tcp(22),
      'Allow SSH traffic from public instance only',
    );

    // User data script for the private instance
    const privateInstanceUserData = ec2.UserData.forLinux();
    privateInstanceUserData.addCommands(
      'yum install -y curl',
      // External call functionality
      `URL="${urlParam.valueAsString}"`,
      `SLEEP=${sleepParam.valueAsNumber}`,
      'cat > /home/ec2-user/websocket_counter.sh << EOF',
      '#!/bin/bash',
      'HOSTNAME=$(hostname)',
      'while true; do',
      '  curl -s "$URL$HOSTNAME" > /dev/null',
      '  sleep $SLEEP',
      'done',
      'EOF',
      'chmod +x /home/ec2-user/websocket_counter.sh',
      'nohup /home/ec2-user/websocket_counter.sh > /dev/null 2>&1 &',
      // Web server functionality
      'mkdir /home/ec2-user/http-server',
      'cd /home/ec2-user/http-server',
      'cat > index.html << EOF',
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '    <meta charset="UTF-8">',
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '    <title>AWS Simple Architecture Demo</title>',
      '    <style>body { font-family: Arial, sans-serif; text-align: center; font-size: 24px; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }</style>',
      '</head>',
      '<body>',
      '    <h1>AWS Simple Architecture Demo</h1>',
      '</body>',
      '</html>',
      'EOF',
      'sudo python3 -m http.server 80'
    );

    // Create the private instance
    const privateInstance = new ec2.Instance(this, 'PrivateInstance', {
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      instanceName: 'private-instance',
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      vpc: vpc,
      securityGroup: privateInstanceSecurityGroup,
      userData: privateInstanceUserData,
      role: privateInstanceRole,
      keyPair: keyPair,
    });

    // User data script for the public instance with all three functionalities
    const publicInstanceUserData = ec2.UserData.forLinux();
    publicInstanceUserData.addCommands(
      // NAT Instance functionality
      'sudo yum install httpd iptables-services -y',
      'echo "net.ipv4.ip_forward=1" | sudo tee --append /etc/sysctl.d/custom-ip-forwarding.conf',
      'sudo sysctl -p /etc/sysctl.d/custom-ip-forwarding.conf',
      'sudo iptables -t nat -A POSTROUTING -o enX0 -j MASQUERADE',
      'sudo iptables -A FORWARD -i enX1 -o enX0 -j ACCEPT',
      'sudo iptables -A FORWARD -i enX0 -o enX1 -m state --state RELATED,ESTABLISHED -j ACCEPT',
      'sudo iptables -F FORWARD',
      'sudo service iptables save',
      'sudo systemctl enable iptables',
      'sudo systemctl start iptables',
      // Reverse Proxy functionality
      'PRIVATE_IP=""',
      'while [ -z "$PRIVATE_IP" ] || [ "$PRIVATE_IP" = "None" ]; do',
      '  sleep 10;',
      '  PRIVATE_IP=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=private-instance" "Name=instance-state-name,Values=running" --query "Reservations[0].Instances[0].PrivateIpAddress" --output text);',
      'done',
      'cat > /etc/httpd/conf.d/proxy.conf << EOF',
      '<VirtualHost *:80>',
      '    ProxyPreserveHost On',
      '    ProxyRequests Off',
      '    ',
      '    # Dynamically configured private server',
      '    ProxyPass / http://$PRIVATE_IP:80/',
      '    ProxyPassReverse / http://$PRIVATE_IP:80/',
      '</VirtualHost>',
      'EOF',
      'httpd -t && sudo systemctl reload httpd',
      'sudo systemctl start httpd',
      'sudo systemctl enable httpd',
    );

    // Create the public instance
    const publicInstance = new ec2.Instance(this, 'PublicInstance', {
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceName: 'public-instance',
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      sourceDestCheck: false, // Disable source/destination check for NAT functionality
      securityGroup: publicInstanceSecurityGroup,
      vpc: vpc,
      userData: publicInstanceUserData,
      role: publicInstanceRole,
      keyPair: keyPair,
    });

    // Create the secondary network interface (private)  
    const privateNetworkInterface = new ec2.CfnNetworkInterface(this, 'PrivateInterface', {
      subnetId: vpc.isolatedSubnets[0].subnetId,
      groupSet: [publicInstanceSecurityGroup.securityGroupId],
      sourceDestCheck: false, // Required for NAT functionality
      description: 'Private interface for internal network',
    });

    // Attach the secondary network interface
    new ec2.CfnNetworkInterfaceAttachment(this, 'PrivateInterfaceAttachment', {
      instanceId: publicInstance.instanceId,
      networkInterfaceId: privateNetworkInterface.ref,
      deviceIndex: '1', // enX1
    });

    // Route 0.0.0.0/0 to the public instance
    new ec2.CfnRoute(this, 'PrivateSubnetDefaultRoute', {
      routeTableId: vpc.isolatedSubnets[0].routeTable.routeTableId,
      destinationCidrBlock: '0.0.0.0/0',
      instanceId: publicInstance.instanceId,
    });

    // Outputs
    new cdk.CfnOutput(this, 'PrivateInstancePrivateIP', {
      value: privateInstance.instancePrivateIp,
      description: 'Private IP of the private instance',
    });

    new cdk.CfnOutput(this, 'PublicInstancePublicIP', {
      value: publicInstance.instancePublicIp,
      description: 'Public IP of the public instance',
    });

    new cdk.CfnOutput(this, 'PublicInstancePrivateIP', {
      value: publicInstance.instancePrivateIp,
      description: 'Private IP of the public instance',
    });
  }
}
